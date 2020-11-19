import { DISTRIBUTER_INITUSER, DISTRIBUTER_INITSUMMARY } from '../constants/distributer';

const INITIAL_STATE = {
  user: {},
  summary: {}
};

export default function distributer(state: any = INITIAL_STATE, action: any) {
  const newState = JSON.parse(JSON.stringify(state));
  switch (action.type) {
    case DISTRIBUTER_INITUSER:
      newState.user = action.data;
      return newState;
    case DISTRIBUTER_INITSUMMARY:
      newState.summary = action.data;
      return newState;
    default:
      return state;
  }
}
