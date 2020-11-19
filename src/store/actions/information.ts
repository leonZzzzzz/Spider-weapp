import { SAVEREFRESHID } from '../constants/information';

export const saveRefreshId = (refreshId: string) => {
  return {
    type: SAVEREFRESHID,
    refreshId
  };
};
