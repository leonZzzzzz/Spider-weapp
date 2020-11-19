import Taro, { useState, useEffect, useShareAppMessage, usePullDownRefresh } from '@tarojs/taro';
import { View } from '@tarojs/components';
import './index.scss';
import { getProjectPage } from '@/api/flywheel';
import withShare from '@/utils/withShare';
import RenderComponent from '@/components/flywheel/render-component';
import { LogoWrap } from '@/components/common';
import { useSelector } from '@tarojs/redux';
import api from '@/api/distributer';

import QcSearchWrap from '@/components/flywheel/cowebs/search-wrap';
import QcActivityGroup from '@/components/flywheel/cowebs/activity-group';
import QcAlumniCircle from '@/components/flywheel/cowebs/alumni-circle';
import QcResourceDocking from '@/components/flywheel/cowebs/resource-docking';
import QcNewsGroup from '@/components/flywheel/cowebs/news-group';
import QcCategoryActivityGroup from '@/components/flywheel/cowebs/category-activity-group';
import QcTitleGroup from '@/components/flywheel/custom/title-group';
import QcMenuWrap from '@/components/flywheel/cowebs/menu-wrap';
import QcSurveyGroup from '@/components/flywheel/cowebs/survey-group';
import QcCourseGroup from '@/components/flywheel/cowebs/course-group';
import QcCategoryCourseGroup from '@/components/flywheel/cowebs/category-course-group';
import QcGroupProductGroup from '@/components/flywheel/mall/group-product-group';
import QcActivityList from '@/components/flywheel/cowebs/activity-list';

import { baseUrl } from '@/config';
import QcCategoryNews from '@/components/flywheel/base/category-news';
import { useTabbar } from '@/useHooks/useFlywheel';

export default function Test() {
  const [pageConfig, setPageConfig] = useState<any>([]);
  const [data] = useState([
    {
      name: 'hyzs',
      layoutAppId: '110dad901fa711eabb70cf51be011db0',
      fileId: 'a546e3601fa611eabb70cf51be011db0'
    },
    {
      name: 'cowebs',
      layoutAppId: '32e87d20110411eab0dcf52c52a60125',
      fileId: 'eb6d0a20110211eab0dcf52c52a60125'
    },
    {
      name: 'jzxz',
      layoutAppId: 'd06419500c4111eaaa6d1753e7106ef9',
      fileId: '75c34aa00c3e11eaaa6d1753e7106ef9'
    },
    {
      name: 'tcwb',
      layoutAppId: 'd0fbe3c010e711ea9e005195d113b503',
      fileId: '33948cb010e511ea9e005195d113b503'
    },
    {
      name: 'blpphd',
      layoutAppId: '04e1a7a0167a11eaa22195339e8b2b08',
      fileId: '099476c0167911eaa22195339e8b2b08'
    }
  ]);
  useTabbar();
  useEffect(() => {
    apiGetProjectPage();
    const options = Taro.getLaunchOptionsSync();
    console.log('--------getLaunchOptionsSync----------', options);
    // if (options.query.bindScene) distributerScanBind(options.query.bindScene)
    // if ((options.scene === 1047 || options.scene === 1048 || options.scene === 1049) && options.query.scene) {
    //   distributerScanBind(options.query.scene)
    // }
  }, []);

  useShareAppMessage(() => {
    return withShare();
  });

  usePullDownRefresh(() => {
    Taro.eventCenter.trigger('pullDownRefresh');
    setTimeout(() => {
      Taro.stopPullDownRefresh();
    }, 500);
  });

  // 绑定
  const distributerScanBind = async (scene: any) => {
    const res = await api.distributerScanBind({ scene });
    const data = res.data.data;
    console.log('扫码绑定---------distributerScanBind', data);
  };

  const apiGetProjectPage = async () => {
    const model = data.filter(item => {
      const reg = new RegExp(item.name);
      return reg.test(baseUrl);
    });
    console.log('apiGetProjectPage', baseUrl, model);

    if (model.length === 0) return;
    const res = await getProjectPage(model[0]);
    if (res.data.data) {
      setPageConfig(JSON.parse(res.data.data.json));
      let data = JSON.parse(res.data.data.json);
      console.log(data);
    }
  };

  // const options = {
  //   name: 'QcCategoryCourseGroup',
  //   categoryList: [
  //     { id: '', name: '全部' },
  //     { id: '90d9cffdced94e9a9b67a4b37868c53c', name: '课程1' },
  //   ]
  // }

  // const titleOptions = {
  //   backgroundColor: "#fff",
  //   href: "/pages/contacts/index",
  //   isMore: true,
  //   more: "More",
  //   title: "超值拼团",
  // }

  return (
    <View>
      {pageConfig && pageConfig.length > 0 ? (
        pageConfig.map((copmonent: any) => {
          return <RenderComponent key={copmonent.name} is={copmonent.name} options={copmonent.options} />;
        })
      ) : (
        <View>
          {/* 
          <QcCourseGroup />
          <QcActivityGroup />
          <QcCategoryCourseGroup options={options} /> */}
          {/* <QcMenuWrap options={menuOptions} />
          <QcTitleGroup options={titleOptions} />
          <QcCategoryActivityGroup options={options} />
          <QcTitleGroup options={titleOptions} />
          <QcSurveyGroup />
          <QcTitleGroup options={titleOptions} />
          <QcActivityGroup />
          <QcTitleGroup options={titleOptions} />
          <QcAlumniCircle />
          <QcTitleGroup options={titleOptions} />
          <QcResourceDocking />
          <QcTitleGroup options={titleOptions} />
          <QcNewsGroup /> */}
        </View>
      )}
      {/* <QcSearchWrap />
      <QcCourseGroup></QcCourseGroup>
      <QcGroupProductGroup />
      <QcSurveyGroup></QcSurveyGroup>
      <QcCategoryNews options={{ categoryList: [{ name: '123', id: '123' }, { name: '全部', id: '' }] }} /> */}
      {/* <QcActivityList /> */}
      <LogoWrap />
    </View>
  );
}

Test.config = {
  enablePullDownRefresh: true
};
