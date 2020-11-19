import { combineReducers } from 'redux';
import distributer from './distributer';
import sharer from './sharer';
import information from './information';

export default combineReducers({
  distributer,
  sharer,
  information
});
