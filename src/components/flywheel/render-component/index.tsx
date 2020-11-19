import Taro from '@tarojs/taro';
import { Block } from '@tarojs/components';
import QcSplit from '@/components/flywheel/custom/split';
import QcText from '@/components/flywheel/custom/text';
import QcSwiper from '@/components/flywheel/custom/swiper';
import QcTitleGroup from '@/components/flywheel/custom/title-group'
import QcVideo from '@/components/flywheel/custom/video';
import QcCustomerService from '@/components/flywheel/custom/customer-service';

import QcMall1 from '@/components/flywheel/mall/mall1';
import QcMallSingle from '@/components/flywheel/mall/mall-single';
import QcGroupProductGroup from '@/components/flywheel/mall/group-product-group'
import QcMallCoupon from '@/components/flywheel/mall/coupon';

import QcCategoryNews from '../base/category-news';
import QcOfficialAccount from '../base/official-account';
import QcXiaoetechCourseVip from '../base/xiaoetech-course-vip'

import QcSearchWrap from '@/components/flywheel/cowebs/search-wrap'
import QcActivityGroup from '@/components/flywheel/cowebs/activity-group'
import QcActivityList from '@/components/flywheel/cowebs/activity-list'
import QcAlumniCircle from '@/components/flywheel/cowebs/alumni-circle'
import QcResourceDocking from '@/components/flywheel/cowebs/resource-docking'
import QcNewsGroup from '@/components/flywheel/cowebs/news-group'
import QcCategoryActivityGroup from '@/components/flywheel/cowebs/category-activity-group'
import QcMenuWrap from '@/components/flywheel/cowebs/menu-wrap'
import QcSurveyGroup from '@/components/flywheel/cowebs/survey-group'
import QcHotZone from '@/components/flywheel/custom/hot-zone';
import QcCourseGroup from '@/components/flywheel/cowebs/course-group'
import QcCategoryCourseGroup from '@/components/flywheel/cowebs/category-course-group'
import QcDonate from '@/components/flywheel/cowebs/donate'


type Props = {
  is: string;
  options: any;
};

export default function RenderComponet(props: Props) {
  const { is, options } = props;
  return (
    <Block>
      {
        {
          'QcSwiper': <QcSwiper options={options}></QcSwiper>,
          'QcSplit': <QcSplit options={options}></QcSplit>,
          'QcText': <QcText options={options}></QcText>,
          'QcMall1': <QcMall1 options={options}></QcMall1>,
          'QcMallSingle': <QcMallSingle options={options} />,
          'QcGroupProductGroup': <QcGroupProductGroup />,
          'QcSearchWrap': <QcSearchWrap options={options} />,
          'QcActivityGroup': <QcActivityGroup />,
          'QcActivityList': <QcActivityList options={options}/>,
          'QcAlumniCircle': <QcAlumniCircle />,
          'QcResourceDocking': <QcResourceDocking />,
          'QcNewsGroup': <QcNewsGroup options={options} />,
          'QcCategoryActivityGroup': <QcCategoryActivityGroup options={options} />,
          'QcCategoryCourseGroup': <QcCategoryCourseGroup options={options} />,
          'QcTitleGroup': <QcTitleGroup options={options} />,
          'QcMenuWrap': <QcMenuWrap options={options} />,
          'QcSurveyGroup': <QcSurveyGroup />,
          'QcHotZone': <QcHotZone options={options}/>,
          'QcCourseGroup': <QcCourseGroup />,
          'QcCategoryNews': <QcCategoryNews options={options} />,
          'OfficialAccount': <QcOfficialAccount />,
          'QcXiaoetechCourseVip': <QcXiaoetechCourseVip options={options} />,
          'QcCustomerService': <QcCustomerService options={options} />,
          'QcMallCoupon': <QcMallCoupon needEmptyPage={true} />,
          'QcVideo': <QcVideo options={options} />,
          'QcDonate': <QcDonate />
        }[is]
      }
      
    </Block>
  );
}