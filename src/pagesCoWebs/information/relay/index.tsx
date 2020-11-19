import Taro, { useState, useEffect, useRouter } from '@tarojs/taro';
import { View, Text, Textarea, Image, Button, Form, Input, Picker } from '@tarojs/components';
import { IMG_HOST, HOME_PATH } from '@/config';
import { Avatar, LogoWrap, LoadingBox, ThemeView } from '@/components/common';
import api from '@/api/cowebs';
import util from '@/utils/util';
import { useDispatch } from '@tarojs/redux';
import { saveRefreshId } from '@/store/actions/information';
import './index.scss';

export default function Release() {
  const dispatch = useDispatch();
  // const [ authorizeVisible, setAuthorizeVisible ] = useState(false)
  const [pageLoading, setPageLoading] = useState(true);

  const weekTexts = ['日', '一', '二', '三', '四', '五', '六'];
  const [dateData] = useState(() => {
    const date = new Date();
    const day = date.getDate();
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const weekDay = date.getDay();
    return {
      day: day > 9 ? day : `0${day}`,
      month: month > 9 ? month : `0${month}`,
      year,
      weekDay: weekTexts[weekDay]
    };
  });
  const [releaseVisible, setReleaseVisible] = useState(false);
  const [category, setCategory] = useState<any>({});
  const [model, setModel] = useState<any>({
    categoryId: '',
    title: '',
    info: '',
    iconUrl: '',
    address: '',
    startTime: '',
    endTime: '',
    activitySignSetting: {
      vipLevel: 0,
      signStartTime: '',
      signEndTime: '',
      maxNum: '',
      singleNum: 1
    },
    wxMiniFormId: ''
  });
  const [timeModel, setTimeModel] = useState({
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: ''
  });
  const [categoryList, setCategoryList] = useState<any[]>([]);
  const [imageUrl, setImageUrl] = useState<any[]>([]);
  const [count] = useState(9); // 上传图片数量
  const [limitSize] = useState(5); // 上传图片限制  5mb
  const router = useRouter();
  const { memberId, appId } = router.params;
  // const appId = "07cd7df0086e49a1897ccbb9bf06acc3"
  // const memberId = "35de584b31ec4c8c975840db8d055c2a"

  useEffect(() => {
    if (memberId) model.memberId = memberId || '';
    if (appId) model.appId = appId || '';
    setModel(model);
    console.log('router', router);

    categoryListByType();
  }, []);

  const categoryListByType = async () => {
    try {
      const res = await api[appId ? 'listByTypeAndAppId' : 'categoryListByType']({ type: 13, appId: appId || '' });
      setCategoryList(res.data.data);
      setPageLoading(false);
    } catch (err) {
      setPageLoading(false);
    }
  };

  const handleClick = (item: any) => {
    setCategory({
      categoryId: item.id,
      name: item.name,
      iconUrl: item.iconUrl
    });
    model.categoryId = item.id;
    setModel(model);
    setReleaseVisible(false);
  };

  // 选择图片
  const chooseImage = async () => {
    const res = await Taro.chooseImage({
      count: 9 - imageUrl.length, // 默认9
      sizeType: ['compressed'] // 可以指定是原图还是压缩图，默认二者都有
    });
    handleWxChooseImage(res.tempFiles, count);
  };

  // 处理小程序端的选择图片上传
  const handleWxChooseImage = async (tempFiles: any[], count: number) => {
    if (!tempFiles.length) return;

    if (tempFiles.length + imageUrl.length > count) {
      util.showToast(`最多上传${count}张图片`);
      return;
    } else {
      util.showLoading(true, '上传图片中...');
      let promiseArray: any[] = [];
      for (let i = 0; i < tempFiles.length; i++) {
        const file = tempFiles[i];
        // 判断选择的图片大小
        const fileSize = file.size / 1024 / 1024;
        if (fileSize > limitSize) {
          util.showToast(`大于${limitSize}MB的图片将不会上传`);
        } else {
          const promise = api.uploadImg(file.path, { imageType: 'information' });
          promiseArray.push(promise);
        }
      }
      try {
        const result = await Promise.all(promiseArray);
        console.log('[result] :', result);
        const _imageUrl = result.map(res => res.data.data.imageUrl);
        setImageUrl(prev => {
          return [...prev, ..._imageUrl];
        });
        util.showLoading(false);
      } catch (err) {
        console.error('upload err :', err);
        // util.showLoading(false);
      }
    }
  };

  const handleInput = (type: string, e: any) => {
    const str = type.split('.');
    let _model = JSON.parse(JSON.stringify(model));
    if (str.length > 1) {
      _model[str[0]][str[1]] = Number(e.detail.value);
    } else {
      _model[type] = e.detail.value;
    }
    setModel(_model);
  };
  const handleDateChange = (type: string, e: any) => {
    console.log(e.detail.value, type);
    setTimeModel(prev => {
      prev[type] = e.detail.value;
      return { ...prev };
    });
  };

  const handleSumbit = (e: any) => {
    model.wxMiniFormId = e.detail.formId;
    console.log(model);
    if (!model.categoryId) {
      showToast('请选择分类');
      return;
    }
    if (!model.title) {
      showToast('请输入标题');
      return;
    }
    if (!model.info) {
      showToast('请输入内容');
      return;
    }

    if (imageUrl.length > 0) {
      model.iconUrl = imageUrl.join(',');
    }
    setModel(model);

    if (!checkTime()) return;
    if (!model.address) {
      showToast('请输入地点');
      return;
    }

    if (model.activitySignSetting.maxNum === '') {
      showToast('请输入次数');
      return;
    }
    console.log(model);
    saveModel();
  };

  const saveModel = async () => {
    Taro.showLoading({
      title: '正在发布...',
      mask: true
    });
    const res = await api.myActivityInsert(model);
    console.log(res.data);
    const message = res.data.message;
    Taro.showToast({
      title: message || '发布成功',
      icon: 'none'
    });
    dispatch(saveRefreshId('new'));

    setTimeout(async () => {
      if (appId) {
        try {
          await Taro.navigateBackMiniProgram({
            extraData: {
              navigateBackMiniProgram: true
            }
          });
        } catch (err) {
          console.warn('navigateToMiniProgram', err);
        }
      } else {
        const pages = Taro.getCurrentPages();
        if (pages.length > 2) {
          Taro.navigateBack({
            delta: 2
          });
        } else {
          Taro.switchTab({
            url: HOME_PATH
          });
        }
      }
    }, 1000);
  };

  const checkTime = () => {
    const { startDate, startTime, endDate, endTime } = timeModel;
    if (!startDate || !startTime) {
      showToast('请选择开始日期和时间');
      return false;
    }
    if (!endDate || !endTime) {
      showToast('请选择开始日期和时间');
      return false;
    }
    const _startTime = `${startDate} ${startTime}:00`;
    const _endTime = `${endDate} ${endTime}:00`;

    if (new Date(_startTime).getTime() >= new Date(_endTime).getTime()) {
      showToast('结束时间不能大于或等于开始时间');
      return false;
    }

    model.startTime = _startTime;
    model.endTime = _endTime;
    model.activitySignSetting.signStartTime = util.getNowFormatDate();
    model.activitySignSetting.signEndTime = _endTime;
    setModel(model);
    return true;
  };

  const showToast = (title: string) => {
    Taro.showToast({
      title,
      icon: 'none'
    });
  };

  return (
    <ThemeView>
      <View className='relay-page'>
        <LoadingBox visible={pageLoading} />

        <View className='relative'>
          <View className='title-wrap' onClick={() => setReleaseVisible(true)} hoverClass='hover-white-color'>
            <View className='category'>
              {category.iconUrl ? (
                <Avatar imgUrl={IMG_HOST + category.iconUrl} />
              ) : (
                <View className='default-img qcfont qc-icon-bianji'></View>
              )}
              <Text>{category.name || '请选择分类'}</Text>
            </View>
            <Text className='qcfont qc-icon-chevron-right' />
          </View>
          <View className='content-box'>
            <View className='input-box'>
              <Input placeholder='请输入接龙活动标题' value={model.title} onInput={e => handleInput('title', e)} />
            </View>
            <View className='textarea-box'>
              <Textarea
                placeholder={`${pageLoading ? '' : '请输入活动内容（禁止发布违禁内容）'}`}
                value={model.info}
                onInput={e => handleInput('info', e)}
              />
            </View>
            <View className='img-box'>
              {imageUrl.map((item: string, index: number) => {
                return (
                  <View className='item' key={item}>
                    <Image src={IMG_HOST + item} mode='aspectFill' />
                    <Text
                      className='qcfont qc-icon-guanbi close'
                      onClick={() => {
                        setImageUrl(prev => {
                          prev.splice(index, 1);
                          return [...prev];
                        });
                      }}
                    />
                  </View>
                );
              })}
              {imageUrl.length < 9 && (
                <View className='add' onClick={chooseImage}>
                  <Text className='qcfont qc-icon-jia' />
                  <View>添加图片</View>
                </View>
              )}
            </View>
          </View>
          <View className='d-line' />
          <View className='input-wrap'>
            <View className='setting-title'>报名设置</View>
            <View className='date-item'>
              <View className='title'>
                <Text className='qcfont qc-icon-shijian2' />
                <Text>活动时间</Text>
              </View>
              <View className='date-content'>
                <Picker
                  mode='date'
                  value={timeModel.startDate}
                  className='date-picker'
                  onChange={e => handleDateChange('startDate', e)}>
                  {timeModel.startDate ? (
                    <View className='picker-text'>{timeModel.startDate}</View>
                  ) : (
                    <View className='picker-placeholder'>选择日期</View>
                  )}
                </Picker>
                <Picker
                  mode='time'
                  value={timeModel.startTime}
                  className='date-picker'
                  onChange={e => handleDateChange('startTime', e)}>
                  {timeModel.startTime ? (
                    <View className='picker-text'>{timeModel.startTime}</View>
                  ) : (
                    <View className='picker-placeholder'>选择时间</View>
                  )}
                </Picker>
                <Text className='dao'>到</Text>
                <Picker
                  mode='date'
                  value={timeModel.endDate}
                  className='date-picker'
                  onChange={e => handleDateChange('endDate', e)}>
                  {timeModel.endDate ? (
                    <View className='picker-text'>{timeModel.endDate}</View>
                  ) : (
                    <View className='picker-placeholder'>选择日期</View>
                  )}
                </Picker>
                <Picker
                  mode='time'
                  value={timeModel.endTime}
                  className='date-picker'
                  onChange={e => handleDateChange('endTime', e)}>
                  {timeModel.endTime ? (
                    <View className='picker-text'>{timeModel.endTime}</View>
                  ) : (
                    <View className='picker-placeholder'>选择时间</View>
                  )}
                </Picker>
              </View>
            </View>
            <View className='item'>
              <View className='title'>
                <Text className='qcfont qc-icon-didian3' />
                <Text>活动地点</Text>
              </View>
              <Input placeholder='请输入地点' value={model.address} onInput={e => handleInput('address', e)} />
            </View>
            <View className='item'>
              <View className='title'>
                <Text className='qcfont qc-icon-banjichengzhang' />
                <Text>接龙次数</Text>
              </View>
              <Input
                placeholder='请输入次数'
                type='number'
                value={model.activitySignSetting.maxNum}
                onInput={e => handleInput('activitySignSetting.maxNum', e)}
              />
            </View>
          </View>

          <View className='submit-wrap'>
            <Form onSubmit={handleSumbit} reportSubmit>
              <Button formType='submit' hoverClass='hover-button'>
                发布
              </Button>
              {/* <Button hoverClass="hover-button">订阅</Button> */}
            </Form>
          </View>
        </View>

        <LogoWrap />

        {releaseVisible && (
          <View className='release-box'>
            <View className='date-box'>
              <View className='day'>{dateData.day}</View>
              <View>
                <View>星期{dateData.weekDay}</View>
                <View>/</View>
                <View>
                  {dateData.month}/{dateData.year}
                </View>
              </View>
            </View>
            <View className='category-box'>
              {categoryList.map((item: any) => {
                return (
                  <View key={item.id} className='item' onClick={() => handleClick(item)} hoverClass='hover-button'>
                    <Avatar imgUrl={IMG_HOST + item.iconUrl} width={80} />
                    <View className='name'>{item.name}</View>
                  </View>
                );
              })}
            </View>
            <View className='qcfont qc-icon-close close' onClick={() => setReleaseVisible(false)} />
          </View>
        )}
      </View>
    </ThemeView>
  );
}

Release.config = {
  navigationBarTitleText: '发布'
};
