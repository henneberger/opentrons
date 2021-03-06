// http api /calibration/** tests
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import client from '../client'
import {
  reducer,
  startDeckCalibration,
  deckCalibrationCommand,
  setCalibrationJogStep,
  makeGetDeckCalibrationStartState,
  makeGetDeckCalibrationCommandState,
  getCalibrationJogStep
} from '..'

jest.mock('../client')

const middlewares = [thunk]
const mockStore = configureMockStore(middlewares)

const NAME = 'opentrons-dev'

describe('/calibration/**', () => {
  let robot
  let state
  let store

  beforeEach(() => {
    client.__clearMock()

    robot = {name: NAME, ip: '1.2.3.4', port: '1234'}
    state = {api: {calibration: {}}}
    store = mockStore(state)
  })

  describe('startDeckCalibration action creator', () => {
    const path = 'deck/start'
    const response = {
      token: 'token',
      pipette: {mount: 'left', model: 'p300_single_v1'}
    }

    test('calls POST /calibration/deck/start', () => {
      const expected = {force: false}

      client.__setMockResponse(response)

      return store.dispatch(startDeckCalibration(robot))
        .then(() => expect(client).toHaveBeenCalledWith(
          robot,
          'POST',
          'calibration/deck/start',
          expected
        ))
    })

    test('calls POST /calibration/deck/start with force: true', () => {
      const expected = {force: true}

      client.__setMockResponse(response)

      return store.dispatch(startDeckCalibration(robot, true))
        .then(() => expect(client).toHaveBeenCalledWith(
          robot,
          'POST',
          'calibration/deck/start',
          expected
        ))
    })

    test('dispatches CAL_REQUEST and CAL_SUCCESS', () => {
      const request = {force: false}
      const expectedActions = [
        {type: 'api:CAL_REQUEST', payload: {robot, request, path}},
        {type: 'api:CAL_SUCCESS', payload: {robot, response, path}}
      ]

      client.__setMockResponse(response)

      return store.dispatch(startDeckCalibration(robot))
        .then(() => expect(store.getActions()).toEqual(expectedActions))
    })

    test('dispatches CAL_REQUEST and CAL_FAILURE', () => {
      const request = {force: false}
      const error = {name: 'ResponseError', status: 409, message: ''}
      const expectedActions = [
        {type: 'api:CAL_REQUEST', payload: {robot, request, path}},
        {type: 'api:CAL_FAILURE', payload: {robot, error, path}}
      ]

      client.__setMockError(error)

      return store.dispatch(startDeckCalibration(robot))
        .then(() => expect(store.getActions()).toEqual(expectedActions))
    })
  })

  describe('deckCalibrationCommand action creator', () => {
    const path = 'deck'
    const token = 'mock-token'
    const request = {command: 'release'}
    const response = {message: 'mock-response'}

    beforeEach(() => {
      state.api.calibration[NAME] = {'deck/start': {response: {token}}}
    })

    test('calls POST /calibration/deck and adds token to request', () => {
      client.__setMockResponse(response)

      return store.dispatch(deckCalibrationCommand(robot, request))
        .then(() => expect(client).toHaveBeenCalledWith(
          robot,
          'POST',
          'calibration/deck',
          {...request, token}
        ))
    })

    test('dispatches CAL_REQUEST and CAL_SUCCESS', () => {
      const expectedActions = [
        {type: 'api:CAL_REQUEST', payload: {robot, request, path}},
        {type: 'api:CAL_SUCCESS', payload: {robot, response, path}}
      ]

      client.__setMockResponse(response)

      return store.dispatch(deckCalibrationCommand(robot, request))
        .then(() => expect(store.getActions()).toEqual(expectedActions))
    })

    test('dispatches CAL_REQUEST and CAL_FAILURE', () => {
      const error = {name: 'ResponseError', message: 'AH'}
      const expectedActions = [
        {type: 'api:CAL_REQUEST', payload: {robot, request, path}},
        {type: 'api:CAL_FAILURE', payload: {robot, error, path}}
      ]

      client.__setMockError(error)

      return store.dispatch(deckCalibrationCommand(robot, request))
        .then(() => expect(store.getActions()).toEqual(expectedActions))
    })
  })

  describe('non-API-call action creators', () => {
    test('setCalibrationJogStep', () => {
      const step = 4
      const expected = {type: 'api:SET_CAL_JOG_STEP', payload: {step}}

      expect(setCalibrationJogStep(step)).toEqual(expected)
    })
  })

  describe('reducer with api-call actions', () => {
    beforeEach(() => {
      state = state.api
    })

    const REDUCER_REQUEST_RESPONSE_TESTS = [
      {
        path: 'deck/start',
        request: {},
        response: {
          token: 'token',
          pipette: {mount: 'left', model: 'p300_single_v1'}
        }
      },
      {
        path: 'deck',
        request: {command: 'save transform'},
        response: {message: 'saved'}
      }
    ]

    REDUCER_REQUEST_RESPONSE_TESTS.forEach((spec) => {
      const {path, request, response} = spec

      describe(`reducer with /calibration/${path}`, () => {
        test('handles CAL_REQUEST', () => {
          const action = {
            type: 'api:CAL_REQUEST',
            payload: {path, robot, request}
          }

          expect(reducer(state, action).calibration).toEqual({
            [NAME]: {
              [path]: {
                request,
                inProgress: true,
                error: null,
                response: null
              }
            }
          })
        })

        test('handles CAL_SUCCESS', () => {
          const action = {
            type: 'api:CAL_SUCCESS',
            payload: {path, robot, response}
          }

          state.calibration[NAME] = {
            [path]: {
              request,
              inProgress: true,
              error: null,
              response: null
            }
          }

          expect(reducer(state, action).calibration).toEqual({
            [NAME]: {
              [path]: {
                request,
                response,
                inProgress: false,
                error: null
              }
            }
          })
        })

        test('handles CAL_FAILURE', () => {
          const error = {message: 'we did not do it!'}
          const action = {
            type: 'api:CAL_FAILURE',
            payload: {path, robot, error}
          }

          state.calibration[NAME] = {
            [path]: {
              request,
              inProgress: true,
              error: null,
              response: null
            }
          }

          expect(reducer(state, action).calibration).toEqual({
            [NAME]: {
              [path]: {
                request,
                error,
                response: null,
                inProgress: false
              }
            }
          })
        })
      })
    })

    // TODO(mc, 2018-05-07): refactor this test according to the TODO in the
    //  CAL_SUCCESS handler in the reducer
    test('CAL_RESPONSE with command: "release" clears token', () => {
      state.calibration[NAME] = {
        deck: {request: {command: 'release'}},
        'deck/start': {response: {token: 'token'}}
      }

      const action = {
        type: 'api:CAL_SUCCESS',
        payload: {robot, path: 'deck', response: {message: 'released'}}
      }

      expect(reducer(state, action).calibration[NAME]['deck/start'].response)
        .toBe(null)
    })
  })

  describe('reducer with non-API-call actions', () => {
    beforeEach(() => {
      state = state.api
    })

    test('handles SET_CAL_JOG_STEP', () => {
      const action = setCalibrationJogStep(5)

      expect(reducer(state, action).calibration).toEqual({
        ...state.calibration,
        jogStep: 5
      })
    })
  })

  describe('selectors', () => {
    beforeEach(() => {
      state.api.calibration[NAME] = {
        deck: {inProgress: true},
        'deck/start': {inProgress: true}
      }
    })

    test('makeGetDeckCalibrationStartState', () => {
      const getStartState = makeGetDeckCalibrationStartState()

      expect(getStartState(state, robot))
        .toEqual(state.api.calibration[NAME]['deck/start'])

      expect(getStartState(state, {name: 'foo'})).toEqual({
        inProgress: false,
        error: null,
        request: null,
        response: null
      })
    })

    test('makeGetDeckCalibrationCommandState', () => {
      const getCommandState = makeGetDeckCalibrationCommandState()

      expect(getCommandState(state, robot))
        .toEqual(state.api.calibration[NAME].deck)

      expect(getCommandState(state, {name: 'foo'})).toEqual({
        inProgress: false,
        error: null,
        request: null,
        response: null
      })
    })

    test('getCalibrationJogStep', () => {
      state.api.calibration.jogStep = 42
      expect(getCalibrationJogStep(state)).toBe(42)
    })
  })
})
