import Taro, { useState, useEffect } from '@tarojs/taro';
import { View } from '@tarojs/components';
import { getProjectPage } from '@/api/flywheel';
import RenderComponent from '@/components/flywheel/render-component';
import { LogoWrap } from '@/components/common';
import api from '@/api/distributer';
import { usePageConfig } from '@/useHooks/useFlywheel';
import FilledBlock from './filled-block';

function CustomTemplate({ index }) {
  const [pageConfig, setPageConfig] = useState<any[]>([]);
  const { layoutAppId, fileId, filledBlock, background } = usePageConfig(index);

  useEffect(() => {
    getProjectPage({
      layoutAppId,
      fileId
    }).then(res => {
      setPageConfig(JSON.parse(res.data.data.json));
      // setPageConfig(pre => {
      //   return [...pre, {name: 'QcDonate', options: {}}]
      // });
    });
    const options = Taro.getLaunchOptionsSync();
    console.log('--------getLaunchOptionsSync----------', options);
    if (
      (options.scene === 1047 || options.scene === 1048 || options.scene === 1049) &&
      options.query.scene != 'norequest'
    ) {
      distributerScanBind(options.query.scene);
    }
  }, []);

  const distributerScanBind = async (scene: any) => {
    const res = await api.distributerScanBind({ scene });
    const data = res.data.data;
    console.log('扫码绑定---------distributerScanBind', data);
  };

  return (
    <View>
      <View style={{ position: 'fixed', top: 0, bottom: 0, zIndex: -1, width: '100%', background }}></View>
      <FilledBlock config={filledBlock} />
      {pageConfig.map(copmonent => {
        return <RenderComponent key={copmonent.name} is={copmonent.name} options={copmonent.options} />;
      })}
      <LogoWrap />
    </View>
  );
}

CustomTemplate.defaultProps = {
  index: 0
};

export default CustomTemplate;
