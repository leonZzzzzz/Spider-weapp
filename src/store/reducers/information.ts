import { SAVEREFRESHID } from '../constants/information';

const INITIAL_STATE = {
  refreshId: ''
};

export default function distributer(state: any = INITIAL_STATE, action: any) {
  const newState = JSON.parse(JSON.stringify(state));
  switch (action.type) {
    case SAVEREFRESHID:
      newState.refreshId = action.refreshId;
      return newState;
    default:
      return state;
  }
}
