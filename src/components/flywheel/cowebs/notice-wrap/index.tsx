import './index.scss';

// import NoticeWrap from '@/components/cowebs/notice-wrap' 
import { NoticeWrap } from '@/components/cowebs' 

export default function QcNoticeWrap() {

  let title = '圣诞节佛i史丹佛的教授副教授防守反击哦动机是佛山'

  return <NoticeWrap title={title} />
}

QcNoticeWrap.options = {
  addGlobalClass: true
}