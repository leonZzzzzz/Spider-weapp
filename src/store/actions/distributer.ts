import { DISTRIBUTER_INITUSER, DISTRIBUTER_INITSUMMARY } from '../constants/distributer';

export const distributerInitUser = (data: any) => {
  return {
    type: DISTRIBUTER_INITUSER,
    data
  };
};

export const distributerInitSummary = (data: any) => {
  return {
    type: DISTRIBUTER_INITSUMMARY,
    data
  };
};
