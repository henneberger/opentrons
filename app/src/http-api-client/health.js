// @flow
// health http api module
import {createSelector} from 'reselect'

import type {State, ThunkPromiseAction, Action} from '../types'
import type {RobotService} from '../robot'

import type {ApiCall} from './types'
import client, {type ApiRequestError} from './client'

type HealthResponse = {
  name: string,
  api_version: string,
  fw_version: string,
}

export type HealthRequestAction = {|
  type: 'api:HEALTH_REQUEST',
  payload: {
    robot: RobotService
  }
|}

export type HealthSuccessAction = {|
  type: 'api:HEALTH_SUCCESS',
  payload: {|
    robot: RobotService,
    health: HealthResponse,
  |}
|}

export type HealthFailureAction = {|
  type: 'api:HEALTH_FAILURE',
  payload: {|
    robot: RobotService,
    error: ApiRequestError,
  |}
|}

export type HealthAction =
 | HealthRequestAction
 | HealthSuccessAction
 | HealthFailureAction

export type RobotHealth = ApiCall<void, HealthResponse>

type HealthState = {
  [robotName: string]: ?RobotHealth
}

export function fetchHealth (robot: RobotService): ThunkPromiseAction {
  return (dispatch) => {
    dispatch(healthRequest(robot))

    return client(robot, 'GET', 'health')
      .then((health) => dispatch(healthSuccess(robot, health)))
      .catch((error) => dispatch(healthFailure(robot, error)))
  }
}

export function healthReducer (
  state: ?HealthState,
  action: Action
): HealthState {
  if (state == null) return {}

  switch (action.type) {
    case 'api:HEALTH_REQUEST':
      return {
        ...state,
        [action.payload.robot.name]: {
          ...state[action.payload.robot.name],
          inProgress: true,
          error: null
        }
      }

    case 'api:HEALTH_SUCCESS':
      return {
        ...state,
        [action.payload.robot.name]: {
          ...state[action.payload.robot.name],
          inProgress: false,
          response: action.payload.health
        }
      }

    case 'api:HEALTH_FAILURE':
      return {
        ...state,
        [action.payload.robot.name]: {
          ...state[action.payload.robot.name],
          inProgress: false,
          error: action.payload.error
        }
      }
  }

  return state
}

export const makeGetRobotHealth = () => createSelector(
  selectRobotHealthState,
  (state: ?RobotHealth): RobotHealth => {
    return state || {inProgress: false, error: null, response: null}
  }
)

function selectRobotHealthState (state: State, props: RobotService) {
  return state.api.health[props.name]
}

function healthRequest (robot: RobotService): HealthRequestAction {
  return {type: 'api:HEALTH_REQUEST', payload: {robot}}
}

function healthSuccess (
  robot: RobotService,
  health: HealthResponse
): HealthSuccessAction {
  return {type: 'api:HEALTH_SUCCESS', payload: {robot, health}}
}

function healthFailure (
  robot: RobotService,
  error: ApiRequestError
): HealthFailureAction {
  return {type: 'api:HEALTH_FAILURE', payload: {robot, error}}
}
