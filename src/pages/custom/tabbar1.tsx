import CustomTemplate from './template';
import { useCustomInit, useTabbar } from '@/useHooks/useFlywheel';

export default function Tabbar1() {
  useTabbar()
  useCustomInit();
  return <CustomTemplate index={0}></CustomTemplate>;
}
