import { SHARER_INITUSER, SHARER_INITSUMMARY } from '../constants/sharer';

const INITIAL_STATE = {
  user: {},
  summary: {}
};

export default function sharer(state: any = INITIAL_STATE, action: any) {
  const newState = JSON.parse(JSON.stringify(state));
  switch (action.type) {
    case SHARER_INITUSER:
      newState.user = action.data;
      return newState;
    case SHARER_INITSUMMARY:
      newState.summary = action.data;
      return newState;
    default:
      return state;
  }
}
