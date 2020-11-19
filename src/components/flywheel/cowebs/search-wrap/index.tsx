import { SearchWrap } from '@/components/common';
import './index.scss';

export default function QcSearchWrap(props: any) {
  const { options } = props;
  return <SearchWrap showInput={false} options={options} />;
}

QcSearchWrap.options = {
  addGlobalClass: true
};
