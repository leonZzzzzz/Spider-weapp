import Taro, { useState, useEffect, useRouter } from '@tarojs/taro';
import { View, Text, Image, Textarea, Form, Button } from '@tarojs/components';
import { IMG_HOST } from '@/config';
import { Avatar, LoadingBox, LogoWrap, ThemeView } from '@/components/common';
import api from '@/api/cowebs';
import './index.scss';

export default function Index() {
  const [pageLoading, setPageLoading] = useState(true);
  const [detail, setDetail] = useState<any>({});
  const [reports, setReports] = useState<any[]>([]);
  const [otherReason, setOtherReason] = useState('');
  const [otherVisible, setOtherVisible] = useState(false);
  const [btnLoading, setBtnLoading] = useState(false);
  const { id, reportMemberId, type } = useRouter().params;
  useEffect(() => {
    getDetail();
    getReportOptions();
  }, []);

  const getDetail = async () => {
    const res = await api.informationGet({ id });
    const data = res.data.data;
    setDetail(data);
    setPageLoading(false);
  };

  // 举报选项
  const getReportOptions = async () => {
    const res = await api.getReportOptions();
    const data = res.data.data.value;
    let reports = data.split('_').map((item: any) => {
      return {
        value: item,
        checked: false
      };
    });
    reports.push({
      value: '其他',
      checked: false
    });
    setReports(reports);
  };

  // 预览轮播列表的大图
  const previewImage = (index: number) => {
    let list = detail.imgUrl.split(',').map((img: string) => IMG_HOST + img);
    let current = list[index];
    Taro.previewImage({
      current,
      urls: list
    });
  };

  const handleChange = (idx: number) => {
    // let _reports = JSON.parse(JSON.stringify(reports))
    // _reports[idx].checked = !_reports[idx].checked
    // setReports(_reports)
    // if (_reports[idx].value === '其他') {
    //   setOtherVisible(_reports[idx].checked)
    // }
    let _reports = JSON.parse(JSON.stringify(reports));
    _reports[idx].checked = !_reports[idx].checked;
    setReports(_reports);
    if (_reports[idx].value === '其他') {
      setOtherVisible(_reports[idx].checked);
    }
  };

  const handleSubimt = async (e: any) => {
    const _reports = reports
      .filter((item: any) => item.checked)
      .map(item => item.value)
      .join('_');
    console.log(_reports);
    if (!_reports) {
      Taro.showToast({
        title: '请选择举报原因',
        icon: 'none'
      });
      return;
    }
    if (otherVisible && !otherReason) {
      Taro.showToast({
        title: '请输入其他原因',
        icon: 'none'
      });
      return;
    }
    const res = await Taro.showModal({
      title: '提示',
      content: '是否举报该资讯'
    });
    if (res.confirm) informationReportSave(e.detail.formId, _reports);
  };

  const informationReportSave = async (wxMiniFormId: string, reportReason: string) => {
    let model = {
      sourceId: id,
      sourceType: type,
      reportReason,
      wxMiniFormId,
      reportMemberId,
      otherReason: otherVisible ? otherReason : ''
    };
    console.log('model', model);
    setBtnLoading(true);
    try {
      const res = await api.informationReportSave(model);
      Taro.showToast({
        title: res.data.message,
        icon: 'none'
      });
      setBtnLoading(false);
      setTimeout(() => {
        Taro.navigateBack();
      }, 2000);
    } catch (err) {
      setBtnLoading(false);
    }
  };

  return (
    <ThemeView>
      <View className='information-detail'>
        <LoadingBox visible={pageLoading} />

        <View className='relative'>
          <View className='category'>#{detail.category}#</View>
          <View className='user-wrap'>
            <View
              className='member-box'
              onClick={() =>
                Taro.navigateTo({ url: `/pagesCoWebs/contacts/detail/index?memberId=${detail.memberId}` })
              }>
              <Avatar imgUrl={detail.headImage} width={80} />
              <View className='user__info'>
                <View className='name'>
                  <Text>{detail.username}</Text>
                  {detail.className && (
                    <Text className='class'>
                      {/-\/-/.test(detail.className) ? detail.className.replace('-/-', '-') : detail.className || '无'}
                    </Text>
                  )}
                </View>
                <View className='time'>{detail.createTimeStr}</View>
              </View>
            </View>
          </View>

          <View className='content-box'>
            <View className='content'>{detail.content}</View>
            {detail.imgUrl && (
              <View className='img-box'>
                {detail.imgUrl.split(',').map((img: string, idx: number) => {
                  return <Image src={IMG_HOST + img} key={img} mode='widthFix' onClick={() => previewImage(idx)} />;
                })}
              </View>
            )}
          </View>

          <View className='mini-box'>
            <View />
            <View className='icon-group'>
              <View className='i-item'>
                <Text className='qcfont qc-icon-zhuanfa' />
                <Text>{detail.shareQuantity}</Text>
              </View>
              <View className='i-item'>
                <Text className='qcfont qc-icon-liuyan-fill' />
                <Text>{detail.commentQuantity}</Text>
              </View>
              <View className='i-item'>
                <Text className='qcfont qc-icon-yulan' />
                <Text>{detail.visitQuantity}</Text>
              </View>
            </View>
          </View>

          <View className='report-wrap'>
            <View className='check-box'>
              {reports.map((item: any, idx: number) => {
                return (
                  <View
                    className='item'
                    key={item.value}
                    hoverClass='hover-white-color'
                    onClick={() => handleChange(idx)}>
                    <Text className={`qcfont ${item.checked ? 'qc-icon-gouxuan2' : 'qc-icon-weixuanzhong'}`} />
                    <Text>{item.value}</Text>
                  </View>
                );
              })}
            </View>
            {otherVisible && (
              <View className='textarea-box'>
                <Textarea
                  value={otherReason}
                  focus
                  placeholder='请输入举报内容，我们会及时反馈'
                  onInput={e => setOtherReason(e.detail.value)}
                />
              </View>
            )}
          </View>

          <View className='submit-wrap'>
            <Form reportSubmit onSubmit={handleSubimt}>
              <Button formType='submit' hoverClass='hover-button' loading={btnLoading}>
                提交
              </Button>
            </Form>
          </View>
        </View>
        <LogoWrap />
      </View>
    </ThemeView>
  );
}

Index.config = {
  navigationBarTitleText: '举报'
};
