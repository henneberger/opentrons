// @flow
import * as React from 'react'
import {type LabwareCalibrationProps} from './ConfirmPositionDiagram'

type Step = 'one' | 'two'
type Channels = 'single' | 'multi'
type TypeKey = 'tiprack' | 'trough' | 'tuberack' | 'plate384' | 'plate96'

const DIAGRAMS: {[TypeKey]: {[Channels]: {[Step]: string}}} = {
  tiprack: {
    single: {
      one: require('./images/step-1-tiprack-single@3x.png'),
      two: require('./images/step-2-tiprack-single@3x.png')
    },
    multi: {
      one: require('./images/step-1-tiprack-multi@3x.png'),
      two: require('./images/step-2-tiprack-multi@3x.png')
    }
  },
  trough: {
    single: {
      one: require('./images/step-1-trough-single@3x.png'),
      two: require('./images/step-2-trough-single@3x.png')
    },
    multi: {
      one: require('./images/step-1-trough-multi@3x.png'),
      two: require('./images/step-2-trough-multi@3x.png')
    }
  },
  tuberack: {
    single: {
      one: require('./images/step-1-tuberack@3x.png'),
      two: require('./images/step-2-tuberack@3x.png')
    },
    multi: {
      one: require('./images/step-1-tuberack@3x.png'),
      two: require('./images/step-2-tuberack@3x.png')
    }
  },
  plate96: {
    single: {
      one: require('./images/step-1-96-wellplate-single@3x.png'),
      two: require('./images/step-2-96-wellplate-single@3x.png')
    },
    multi: {
      one: require('./images/step-1-96-wellplate-multi@3x.png'),
      two: require('./images/step-2-96-wellplate-multi@3x.png')
    }
  },
  plate384: {
    single: {
      one: require('./images/step-1-384-wellplate-single@3x.png'),
      two: require('./images/step-2-384-wellplate-single@3x.png')
    },
    multi: {
      one: require('./images/step-1-384-wellplate-multi@3x.png'),
      two: require('./images/step-2-384-wellplate-multi@3x.png')
    }
  }
}

const INSTRUCTIONS: {[TypeKey]: {[Channels]: {[Step]: string | React.Node}}} = {
  tiprack: {
    single: {
      one: 'Jog pipette until it is centered above tip A1.',
      two: (<p>Jog pipette until it is <strong>flush</strong> with the top of the tip.</p>)
    },
    multi: {
      one: 'Jog pipette until it is centered above tips in column 1.',
      two: (<p>Jog pipette until it is flush with the top of the tips.</p>)
    }
  },
  trough: {
    single: {
      one: 'Jog pipette until tip is centered by the back of trough A1.',
      two: (<p>Jog pipette tip until it is <strong>flush</strong> with the top of the trough.</p>)
    },
    multi: {
      one: 'Jog pipette until tips are centered above trough A1.',
      two: (<p>Jog pipette tips until they are <strong>flush</strong> with the top of the trough.</p>)
    }
  },
  tuberack: {
    single: {
      one: 'Jog pipette until tip is centered above tube A1.',
      two: (<p>Jog pipette tip until it is <strong>flush</strong> with the top of the tube.</p>)
    },
    multi: {
      one: 'warning: you can not use a multichannel pipette with a tube rack',
      two: 'warning: you can not use a multichannel pipette with a tube rack'
    }
  },
  plate96: {
    single: {
      one: 'Jog pipette until tip is centered above well A1.',
      two: (<p>Jog pipette tip until it is <strong>flush</strong> with the top of the well.</p>)
    },
    multi: {
      one: 'Jog pipette until tips are centered above the wells in column 1.',
      two: (<p>Jog pipette tips until they are <strong>flush</strong> with the top of the wells.</p>)
    }
  },
  plate384: {
    single: {
      one: 'Jog pipette until tip is centered above well A1.',
      two: (<p>Jog pipette tip until it is <strong>flush</strong> with the top of the well.</p>)
    },
    multi: {
      one: 'Jog pipette until tips are centered above the wells indicated in column 1.',
      two: (<p>Jog pipette tips until they are <strong>flush</strong> with the top of the wells.</p>)
    }
  }
}

export function getDiagramSrc (props: LabwareCalibrationProps) {
  const typeKey = getTypeKey(props)
  const channelsKey = getChannelsKey(props)
  return DIAGRAMS[typeKey][channelsKey]
}

export function getInstructionsByType (props: LabwareCalibrationProps) {
  const typeKey = getTypeKey(props)
  const channelsKey = getChannelsKey(props)
  return INSTRUCTIONS[typeKey][channelsKey]
}

function getTypeKey (props: LabwareCalibrationProps) {
  const {type, isTiprack} = props
  let typeKey
  if (isTiprack) {
    typeKey = 'tiprack'
  } else if (type.includes('trough')) {
    typeKey = 'trough'
  } else if (type.includes('tube-rack')) {
    typeKey = 'tuberack'
  } else if (type.includes('384')) {
    typeKey = 'plate384'
  } else {
    typeKey = 'plate96'
  }
  return typeKey
}

function getChannelsKey (props: LabwareCalibrationProps) {
  const {calibrator: {channels}} = props
  const channelsKey = channels === 8
    ? 'multi'
    : 'single'
  return channelsKey
}
