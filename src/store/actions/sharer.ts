import { SHARER_INITUSER, SHARER_INITSUMMARY } from '../constants/sharer';

export const sharerInitUser = (data: any) => {
  return {
    type: SHARER_INITUSER,
    data
  };
};

export const sharerInitSummary = (data: any) => {
  return {
    type: SHARER_INITSUMMARY,
    data
  };
};
