import Taro, { useState, useEffect, useRouter, usePageScroll, useShareAppMessage } from '@tarojs/taro';
import { View, Image, Text, Textarea, Button, Form } from '@tarojs/components';
import { IMG_HOST } from '@/config';
import withShare from '@/utils/withShare';
import api from '@/api/cowebs';
import util from '@/utils/util';
import { LoadingBox, AuthorizeWrap, LogoWrap, ContentWrap, ThemeView } from '@/components/common';
import { checkAuthorize } from '@/utils/authorize';
import './index.scss';

export default function Detail() {
  const [authorizeVisible, setAuthorizeVisible] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [detail, setDetail] = useState<any>({});
  const [scrollTop, setScrollTop] = useState(0);

  const query = useRouter().params;
  const id = query.scene || query.id;
  usePageScroll(e => {
    setScrollTop(e.scrollTop);
  });

  useEffect(() => {
    getDetail();
  }, []);

  useShareAppMessage(() => {
    return withShare({
      title: detail.title,
      imageUrl: IMG_HOST + detail.picture,
      path: `/pagesCoWebs/survey/detail/index?id=${detail.id}`
    });
  });

  const getDetail = async () => {
    const res = await api.surveyGet({ id });
    const data = res.data.data;
    Taro.setNavigationBarTitle({
      title: data.survey.title
    });
    if (data.count > 0) {
      Taro.redirectTo({
        url: `/pagesCoWebs/survey/result/index?id=${id}`
      });
    } else {
      data.survey.questionList.map((item: any) => {
        if (item.optionList) {
          item.optionList.map((label: any) => {
            label.checked = false;
          });
        } else {
          item.value = '';
        }
      });
      setDetail(data.survey);
      setPageLoading(false);
      util.setNavigationBarTitle(data.title);
    }
  };

  const previewImage = (img: string) => {
    const attachmentList = [IMG_HOST + img];
    Taro.previewImage({
      current: IMG_HOST + img,
      urls: attachmentList
    });
  };

  const handleSelect = (label: any, i: number) => {
    if (detail.status === 0) {
      Taro.showToast({
        title: '问卷未开始',
        icon: 'none'
      });
      return;
    }
    if (detail.status === 2) {
      Taro.showToast({
        title: '问卷已结束',
        icon: 'none'
      });
      return;
    }
    checkAuthorize({
      success: () => {
        let item = detail.questionList[i];

        item.optionList.map((value: any) => {
          if (label.id === value.id) {
            value.checked = !value.checked;
          }
          if (item.type === 1 && label.id !== value.id) value.checked = false;
        });

        detail.questionList[i] = item;
        setDetail(e => {
          return JSON.parse(JSON.stringify(e));
        });
      }
    });
  };

  const handleInput = (i: number, e: any) => {
    console.log(i, e);
    detail.questionList[i].value = e.detail.value;
    setDetail(detail);
  };

  const setScroll = (i: number) => {
    const query = Taro.createSelectorQuery();
    query.selectAll('.question__subject-item').boundingClientRect();
    query.exec(res => {
      let _scrollTop = res[0][i].top;
      Taro.pageScrollTo({
        scrollTop: scrollTop + _scrollTop
      });
    });
  };

  const checkUp = () => {
    for (let i = 0, len = detail.questionList.length; i < len; i++) {
      let item = detail.questionList[i];
      if (item.optionList) {
        let count = 0;
        for (let j = 0, len = item.optionList.length; j < len; j++) {
          if (item.optionList[j].checked) count++;
        }
        if (count === 0) {
          setScroll(i);
          Taro.showToast({
            title: '请作答',
            icon: 'none'
          });
          return false;
        }
      } else {
        if (!item.value) {
          setScroll(i);
          Taro.showToast({
            title: '请作答',
            icon: 'none'
          });
          return false;
        }
      }
    }
    return true;
  };
  const handleSubmit = (e: any) => {
    if (detail.status === 0) {
      Taro.showToast({
        title: '问卷未开始',
        icon: 'none'
      });
      return;
    }
    if (detail.status === 2) {
      Taro.showToast({
        title: '问卷已结束',
        icon: 'none'
      });
      return;
    }

    if (checkUp()) {
      checkAuthorize({
        success: () => {
          let model: any = {
            entryType: 'miniProgram',
            surveyId: id,
            answerList: [],
            wxMiniFormId: e.detail.formId
          };
          for (let i = 0, len = detail.questionList.length; i < len; i++) {
            let item = detail.questionList[i];
            if (item.optionList) {
              for (let j = 0, len = item.optionList.length; j < len; j++) {
                if (item.optionList[j].checked) {
                  let answerItem: any = {
                    questionId: item.id,
                    type: item.type,
                    value: item.optionList[j].id,
                    tagId: item.optionList[j].tagId || ''
                  };
                  model.answerList.push(answerItem);
                }
              }
            } else {
              let answerItem = {
                questionId: item.id,
                type: item.type,
                value: item.value,
                tagId: item.tagId || ''
              };
              model.answerList.push(answerItem);
            }
          }
          memberSurveySubmit(model);
        }
      });
    }
  };
  const memberSurveySubmit = async (params: any) => {
    const res = await api.memberSurveySubmit(params);
    Taro.showToast({
      title: res.data.message,
      icon: 'none'
    });
    setTimeout(() => {
      Taro.redirectTo({
        url: `/pagesCoWebs/survey/result/index?id=${id}`
      });
    }, 1000);
  };

  return (
    <ThemeView>
      <View className='survey-detail' style={{ background: detail.color }}>
        <LoadingBox visible={pageLoading} />

        <View className='question relative' style={{ background: detail.color, color: detail.color }}>
          <View className='top-bg' onClick={() => previewImage(detail.picture)}>
            {detail.picture && <Image src={IMG_HOST + detail.picture} mode='widthFix' />}
          </View>
          {detail.showTitle && <View className='question__title'>{detail.title}</View>}
          <View className='question__introduce'>
            <ContentWrap content={detail.content} />
          </View>
          {detail.questionList && detail.questionList.length > 0 && (
            <View className='question__subject'>
              {detail.questionList.map((item: any, i: number) => {
                return (
                  <View className='question__subject-item' key={item.id}>
                    <View className='question__subject-item-title-box'>
                      <View className='title'>
                        {item.seqNum}、{item.title}
                      </View>
                      {item.picture && (
                        <View className='picture' onClick={() => previewImage(item.picture)}>
                          <Image src={IMG_HOST + item.picture} mode='widthFix' />
                        </View>
                      )}
                    </View>
                    {item.type < 3 ? (
                      <View className='question__subject-item-select'>
                        {item.optionList.map((label: any) => {
                          return (
                            <View className='s-item' key={label.id} onClick={() => handleSelect(label, i)}>
                              <View className='icon-box'>
                                {item.type === 1 ? (
                                  <View
                                    className={`qcfont ${label.checked ? 'qc-icon-xuanzhong' : 'qc-icon-weixuanzhong'}`}
                                  />
                                ) : (
                                  <View
                                    className={`qcfont ${label.checked ? 'qc-icon-gouxuan2' : 'qc-icon-weixuanzhong'}`}
                                  />
                                )}
                              </View>
                              {label.picture && (
                                <View className='s-item-img' onClick={e => e.stopPropagation()}>
                                  <Image
                                    src={IMG_HOST + label.picture}
                                    mode='widthFix'
                                    onClick={() => previewImage(label.picture)}
                                  />
                                </View>
                              )}
                              {label.value && <Text className='s-item-value'>{label.value}</Text>}
                            </View>
                          );
                        })}
                      </View>
                    ) : (
                      <View className='question__subject-item-textarea'>
                        <Textarea
                          value={item.value}
                          maxlength={300}
                          placeholder='说点什么吧~'
                          onInput={e => handleInput(i, e)}
                        />
                        <View className='xian'>限300字符({item.value.length}/300)</View>
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          )}
          <View className='question-submit'>
            <Form onSubmit={handleSubmit} reportSubmit>
              <Button type='primary' formType='submit'>
                提交
              </Button>
            </Form>
          </View>
        </View>
        <LogoWrap />

        <AuthorizeWrap visible={authorizeVisible} onHide={() => setAuthorizeVisible(false)} isClose={true} />
      </View>
    </ThemeView>
  );
}
