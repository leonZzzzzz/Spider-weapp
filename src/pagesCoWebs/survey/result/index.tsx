import Taro, { useState, useEffect, useRouter, useShareAppMessage } from '@tarojs/taro';
import { View, Image, Text, Button } from '@tarojs/components';
import { IMG_HOST } from '@/config';
import withShare from '@/utils/withShare';
import api from '@/api/cowebs';
import util from '@/utils/util';
import { LoadingBox, LogoWrap, ThemeView } from '@/components/common';
import './index.scss';

export default function Result() {
  const [pageLoading, setPageLoading] = useState(true);
  const [result, setResult] = useState<any>({});
  const { id } = useRouter().params;

  useShareAppMessage(() => {
    return withShare({
      title: result.title,
      imageUrl: IMG_HOST + result.picture,
      path: `/pagesCoWebs/survey/detail/index?id=${result.id}`
    });
  });

  useEffect(() => {
    surveyGetResult();
  }, []);

  const surveyGetResult = async () => {
    const res = await api.surveyGetResult({ id });
    const data = res.data.data;
    setResult(data);
    setPageLoading(false);
    util.setNavigationBarTitle(data.title);
  };

  const previewImage = (img: string) => {
    const attachmentList = [IMG_HOST + img];
    Taro.previewImage({
      current: IMG_HOST + img,
      urls: attachmentList
    });
  };

  return (
    <ThemeView>
      <View className='survey-result' style={{ background: result.color }}>
        <LoadingBox visible={pageLoading} />
        <View className='relative'>
          <View className='top-bg' onClick={() => previewImage(result.picture)}>
            {result.picture && <Image src={IMG_HOST + result.picture} mode='widthFix' />}
          </View>
          <View className='result-box' style={{ background: result.color }}>
            <View className='result'>
              {result.questionList && result.questionList.length > 0 && (
                <View className='result-list'>
                  {result.questionList.map((item: any) => {
                    return (
                      item.type !== 3 && (
                        <View className='result-item' key={item.id}>
                          <View className='result-item-title-box'>
                            <View className='title'>
                              {item.seqNum}、{item.title}
                            </View>
                            {item.picture && (
                              <View className='picture' onClick={() => previewImage(item.picture)}>
                                <Image src={IMG_HOST + item.picture} mode='widthFix' />
                              </View>
                            )}
                          </View>
                          {item.optionList.map((label: any) => {
                            return (
                              <View className='answer-item' key={label}>
                                <View className='a-title'>
                                  {label.picture && (
                                    <View className='a-title-img'>
                                      <Image
                                        src={IMG_HOST + label.picture}
                                        mode='widthFix'
                                        onClick={() => previewImage(label.picture)}
                                      />
                                    </View>
                                  )}
                                  {label.value && <Text className='a-title-value'>{label.value}</Text>}
                                </View>
                                <View className='progress'>
                                  <View className='progress-bar'>
                                    <View className='progress-box'>
                                      <View
                                        className='progress-length'
                                        style={{
                                          width: (label.chooseNum / result.joinNum) * 100 + '%',
                                          background: result.color
                                        }}></View>
                                    </View>
                                  </View>
                                  <View className='progress-text'>
                                    {((label.chooseNum / result.joinNum) * 100).toFixed(2)}%
                                  </View>
                                </View>
                              </View>
                            );
                          })}
                        </View>
                      )
                    );
                  })}
                </View>
              )}
            </View>
          </View>
          <View className='result-submit'>
            <Button type='primary' disabled>
              您已投票
            </Button>
          </View>
        </View>
        <LogoWrap />
      </View>
    </ThemeView>
  );
}

Result.config = {
  navigationBarTitleText: '问卷结果'
};
