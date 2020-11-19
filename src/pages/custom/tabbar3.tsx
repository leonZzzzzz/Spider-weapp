import CustomTemplate from './template';
import { useCustomInit, useTabbar } from '@/useHooks/useFlywheel';

export default function Tabbar3() {
  useTabbar();
  useCustomInit();
  return <CustomTemplate index={2}></CustomTemplate>;
}
