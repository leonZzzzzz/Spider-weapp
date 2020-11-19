import CustomTemplate from './template';
import { useCustomInit, useTabbar } from '@/useHooks/useFlywheel';

export default function Tabbar4() {
  useTabbar();
  useCustomInit();
  return <CustomTemplate index={3}></CustomTemplate>;
}
