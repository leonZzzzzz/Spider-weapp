import CustomTemplate from './template';
import { useCustomInit, useTabbar } from '@/useHooks/useFlywheel';

export default function Tabbar2() {
  useTabbar();
  useCustomInit();
  return <CustomTemplate index={1}></CustomTemplate>;
}
