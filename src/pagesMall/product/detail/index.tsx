import Taro, { useState, useDidShow, usePullDownRefresh, useShareAppMessage, useEffect } from '@tarojs/taro';
import { View, Text, Image, ScrollView, Button } from '@tarojs/components';
import './index.scss';
import util from '@/utils/util';
import api from '@/api/index';
import withShare from '@/utils/withShare';
import { IMG_HOST } from '@/config';
import { getProduct, getProductStock, addProduct } from '@/api/product';
import { addCart } from '@/api/cart';
import { checkVisitor } from '@/utils/authorize';
import QcMallCoupon from '@/components/flywheel/mall/coupon';

import {
  LogoWrap,
  Dialog,
  ContentWrap,
  LoadingBox,
  ShareWrap,
  DividingLine,
  BottomBar,
  QcInputNumber
} from '@/components/common';
import { SwiperWrap, SmallEvaluateItem } from '@/components/mall';

import DrawImageData from './json';

export default function Index() {
  const [windowHeight] = useState(() => {
    const { windowHeight, windowWidth } = Taro.getSystemInfoSync();
    const screenK = windowWidth / 750;
    return windowHeight / screenK;
  });
  const [pageLoading, setPageLoading] = useState(true);
  const [btnLoading, setBtnLoading] = useState(false);
  const [type, setType] = useState('all');
  const [collected, setCollected] = useState(false); // 收藏
  const [model, setModel] = useState<any>({
    // 选择的商品信息
    id: '',
    qty: 1,
  });
  const [product, setProduct] = useState<any>({
    // 商品信息
    qty: 1,
    enabledBuy: true,
    isSell: true,
    minOrderQuantity: 1
  });
  const [productSwiperItem, setProductSwiperItem] = useState<any[]>([]);
  const [productStock, setProductStock] = useState<any>({
    info: {},
    minOrderQuantity: 1
  });
  const [propertys, setPropertys] = useState<any[]>([]);
  const [isSelectedProduct, setIsSelectedProduct] = useState(false);
  const [sellout, setSellout] = useState(false);

  const [specsVisible, setSpecsVisible] = useState(false);
  const [shareVisible, setShareVisible] = useState(false);
  const [posterVisible, setPosterVisible] = useState(false);
  const [posterLoading, setPosterLoading] = useState(true);
  const [posterUrl, setPosterUrl] = useState('');
  const [template, setTemplate] = useState<any>({});
  const [QRCodeUrl, setQRCodeUrl] = useState('');
  const [productEvaluateInfo, setProductEvaluateInfo] = useState<any>({});
  const [productEvaluate, setProductEvaluate] = useState<any[]>([]);
  const [transportExpenses, setTransportExpenses] = useState<any>({});

  const [query, setQuery] = useState<any>({});

  useEffect(() => {
    console.log('$router.params', this.$router.params);
    initialize(this.$router.params);
    console.log(Taro.getSystemInfoSync());
    console.log('windowHeight', windowHeight);
  }, []);

  useDidShow(() => {
    if (query.id) productGet(query);
  });
  usePullDownRefresh(() => {
    productGet(query);
  });

  const initialize = async (params: any) => {
    let model = {
      storeId: Taro.getStorageSync('storeId'),
      id: params.id
    };
    if (params.scene) {
      const sceneData = await sceneWxQRCode(params.scene);
      model.id = sceneData.id;
    }
    setQuery(model);
  };
  useEffect(() => {
    console.log('useEffect query', query);
    if (query.id) productGet(query);
  }, [query]);

  const sceneWxQRCode = async scene => {
    const res = await api.sceneWxQRCode({ scene });
    const data = res.data.data;
    return data;
  };

  /**
   * 分享
   */
  useShareAppMessage(() => {
    return withShare({
      title: product.name,
      imageUrl: IMG_HOST + product.iconUrl,
      path: `/pagesMall/product/detail/index?id=${product.id}`
    });
  });

  /**
   *  获取商品评价汇总数据
   */
  const getProductEvaluateInfo = async (productId: string) => {
    const res = await api.getProductEvaluateInfo({ productId });
    setProductEvaluateInfo(res.data.data);
  };
  /**
   *  获取精选的商品评价列表
   */
  const getChosenEvaluate = async (productId: string) => {
    const res = await api.getChosenEvaluate({ productId, chosenNum: 10 });
    setProductEvaluate(res.data.data.list);
  };

  /**
   * 获取商品详情
   * @param id 商品id
   * @param storeId 门店id
   */
  const productGet = async (params: any) => {
    const res = await getProduct(params);
    console.log(res.data);
    let data = res.data.data;
    util.setNavigationBarTitle(data.product.name);

    // 处理轮播图数据
    let imgList = data.product.rollingImgUrl.split('_');
    imgList = imgList.map((item: string) => {
      return IMG_HOST + item;
    });

    // 处理规格数据
    let choiceProp = 0;
    let propertys = data.propertyList.map((item: any) => {
      // 如果每个规格列表都只有一个时则默认选择
      if (item.valueList.length === 1) {
        item.selectIndex = 0;
        choiceProp++;
      } else {
        item.selectIndex = '';
      }
      return item;
    });
    if (!data.product.minOrderQuantity) data.product.minOrderQuantity = 1
    setPropertys(propertys);
    setCollected(data.collected);
    setProductSwiperItem(imgList);
    setProduct(data.product);
    setTransportExpenses(data.transportExpenses);
    setProductStock({
      info: {},
      price: data.product.price,
      vipPrice: data.product.vipPrice,
      qty: data.product.qty,
      iconUrl: data.product.iconUrl,
      minOrderQuantity: data.product.minOrderQuantity
    });
    setModel((prevState: any) => {
      return { ...prevState, qty: data.product.minOrderQuantity }
    });

    if (propertys.length === choiceProp) {
      apiGetProductStock(propertys);
    }
    setPageLoading(false);
    getProductEvaluateInfo(data.product.id);
    getChosenEvaluate(data.product.id);
    Taro.stopPullDownRefresh();
  };

  /**
   * 喜欢
   */
  const handleLike = async () => {
    let type = collected ? 'delCollection' : 'addCollection';
    console.log(type);
    let params = {
      productId: product.id,
      storeId: product.storeId
    };
    await api[type](params);
    setCollected(!collected);
  };

  /**
   * 选择规格
   * @param index 规格下标
   * @param vIndex 规格子项下标
   */
  const selectProperty = (index: number, vIndex: number) => {
    for (let i = 0; i < propertys.length; i++) {
      if (index === i && propertys[index].selectIndex === vIndex) {
        return;
      }
    }
    setPropertys((prevState: any[]) => {
      prevState[index].selectIndex = vIndex;
      return [...prevState];
    });
    setModel((prevState: any) => {
      return { ...prevState, qty: 1 };
    });
    apiGetProductStock(propertys);
  };

  /**
   * 获取商品规格库存
   */
  const apiGetProductStock = async (propertys: any[]) => {
    console.log('apiGetProductStock propertys', propertys);
    let stockParams: any = {
      productId: query.id
    };
    for (let i = 0; i < propertys.length; i++) {
      let index = propertys[i].selectIndex;
      // 未选择对应的规格
      if (index === '') {
        setIsSelectedProduct(false);
        return;
      } else {
        let value = propertys[i].valueList[index];
        stockParams[`spec${i + 1}Value`] = value;
      }
    }
    let res = await getProductStock(stockParams);
    let data = res.data.data;
    if (!data.minOrderQuantity) data.minOrderQuantity = 1
    // data.qty = 0;
    setProductStock({
      info: stockParams,
      price: data.price,
      vipPrice: data.vipPrice,
      qty: data.qty,
      iconUrl: data.iconUrl,
      minOrderQuantity: data.minOrderQuantity
    });
    setModel((prevState: any) => {
      return { ...prevState, id: data.id, qty: data.minOrderQuantity}
    });
    setIsSelectedProduct(true);
    setSellout(data.qty > 0 ? false : true);
  };
  // useEffect(() => {
  //   console.log('isSelectedProduct', isSelectedProduct);
  // }, [isSelectedProduct]);

  // 点击购买
  const handleBuyType = (type: string) => {
    setType(type);
    setSpecsVisible(true);
  };

  const nowBuy = async (type: string) => {
    if (!isSelectedProduct) {
      util.showToast('请选择规格');
      return;
    }
    setType(type);
    const params = {
      ...model,
      storeId: product.storeId
    };

    if (type === 'buy') {
      const res = await addProduct(params);
      util.navigateTo(`/pagesMall/confirm-order/index?id=${res.data.data.id}`);
    } else {
      await addCart(params);
      util.showToast('已添加到购物车', 'success');
    }

    setSpecsVisible(false);
    setModel((prev: any) => {
      return { ...prev, qty: 1 };
    });
  };

  const generatePoster = async () => {
    setPosterVisible(true);
    const memberInfo = Taro.getStorageSync('memberInfo') || {};
    console.log('memberInfo', memberInfo);
    if (!memberInfo.headImage && (!memberInfo.name || !memberInfo.appellation)) {
      const { userInfo } = (await Taro.getUserInfo()) as any;
      console.log('getUserInfo', userInfo);
      memberInfo.headImage = userInfo.avatarUrl;
      memberInfo.name = userInfo.nickName;
    }
    try {
      let _QRCodeUrl = QRCodeUrl;
      if (!_QRCodeUrl) {
        const res = await api.getWxQRCode({ sourceId: product.id, name: 'product' });
        console.log(res.data);
        _QRCodeUrl = res.data.message;
        setQRCodeUrl(_QRCodeUrl);
      }
      console.log('_QRCodeUrl ===========', _QRCodeUrl);
      setTemplate(new DrawImageData().palette(product, memberInfo, _QRCodeUrl));
    } catch (err) {
      setPosterVisible(false);
    }
  };

  const handleImgOK = (e: any) => {
    console.warn('handleImgOK', e);
    setPosterUrl(e.detail.path);
    setPosterLoading(false);
  };

  const savePoster = async () => {
    Taro.showLoading({
      title: '生成图片中',
      mask: true
    });
    setPosterLoading(true);
    try {
      const res = await Taro.saveImageToPhotosAlbum({
        filePath: posterUrl
      });
      console.log(res);
      Taro.hideLoading();
      Taro.showToast({
        title: '已保存到本地'
      });
      setPosterLoading(false);
    } catch (err) {
      setPosterLoading(false);
      console.log(err);
      Taro.hideLoading();
      if (/saveImageToPhotosAlbum/.test(err.errMsg)) util.checkAuthorizeWritePhotosAlbum();
      else {
        Taro.showToast({
          title: '取消保存，可重试',
          icon: 'none'
        });
      }
    }
  };

  return (
    <View className='group-product-detail'>
      <LoadingBox visible={pageLoading} />

      <View className='relative'>
        {productSwiperItem && <SwiperWrap swiperData={productSwiperItem} isDetail={true} />}
        
        {/* 优惠券组件 */}
        <QcMallCoupon white />

        <View className='title-wrap'>
          <View className='top'>
            <View className='left'>
              <View className='title'>{product.name}</View>
              <View className='price-wrap'>
                <Text className='price'>{util.filterPrice(product.price)}</Text>
                <Text className='origin-price'>￥{util.filterPrice(product.origPrice)}</Text>
              </View>
            </View>
            <View className='right' onClick={handleLike}>
              <Text className={`qcfont ${collected ? 'qc-icon-like' : 'qc-icon-like-o'}`}></Text>
              <Text>喜欢</Text>
            </View>
          </View>

          {!product.isVirtual && (
            <View className='bottom'>
              {transportExpenses && transportExpenses.amount > 0 ? (
                <View className='kuai'>
                  快递：{util.filterPrice(transportExpenses.amount)}元
                  {transportExpenses.freeAmount && (
                    <Text>，满{util.filterPrice(transportExpenses.freeAmount)}元包邮</Text>
                  )}
                  {transportExpenses.freeQuantity && <Text>，满{transportExpenses.freeQuantity}件包邮</Text>}
                </View>
              ) : (
                <View className='kuai'>快递：包邮</View>
              )}
              <View className='gou'>已售{product.salesQuantity || 0}件</View>
            </View>
          )}
        </View>

        <View className='specs-wrap'>
          <View className='unit'>规格</View>
          <View className='value' onClick={() => setSpecsVisible(true)}>
            {isSelectedProduct ? (
              <Text className='black'>
                已选择：
                {Object.keys(productStock.info).map(infoItem => {
                  return infoItem === 'productId' ? '' : <Text key={infoItem}>"{productStock.info[infoItem]}"</Text>;
                })}
              </Text>
            ) : (
              <Text className='black'>请选择规格</Text>
            )}

            <Text className='qcfont qc-icon-chevron-right'></Text>
          </View>
        </View>

        {productEvaluateInfo.totalQuantity && (
          <View>
            <DividingLine />
            <View className='evaluate-wrap'>
              <View className='e-title'>
                <View className='title'>商品评价（{productEvaluateInfo.totalQuantity}）</View>
                <View
                  className='more'
                  onClick={() => util.navigateTo(`/pagesMall/evaluate/list/index?productId=${product.id}`)}>
                  <Text>好评率</Text>
                  <Text className='red'>{productEvaluateInfo.goodRate * 100}%</Text>
                  <Text className='qcfont qc-icon-chevron-right'></Text>
                </View>
              </View>
              <ScrollView className='list' scrollX>
                {productEvaluate.map((item: any, index: number) => {
                  return <SmallEvaluateItem item={item} index={index} key={item.id} />;
                })}
              </ScrollView>
            </View>
          </View>
        )}

        <DividingLine />

        <ContentWrap title='商品详情' content={product.content} />
      </View>

      <BottomBar
        showCart={true}
        showPraise={false}
        showComment={false}
        isPoster={true}
        onShare={() => setShareVisible(true)}>
        <View className='right-btn-wrap'>
          <Button className='add' onClick={() => handleBuyType('add')}>
            加入购物车
          </Button>

          <Button className='buy' onClick={() => handleBuyType('buy')}>
            立刻购买
          </Button>
        </View>
      </BottomBar>

      <LogoWrap bottom={110} />

      {/* 选择规格购买弹窗 */}
      <Dialog
        visible={specsVisible}
        position='bottom'
        styles={{ height: Taro.pxTransform(windowHeight * 0.85) }}
        isMaskClick={false}
        onClose={() => setSpecsVisible(false)}>
        <View className='assemble-dialog'>
          <View className='close' onClick={() => setSpecsVisible(false)}>
            <Text className='qcfont qc-icon-close'></Text>
          </View>
          <View className='info-section'>
            <View className='cover'>
              {productStock.iconUrl && (
                <Image className='img' mode='aspectFill' src={IMG_HOST + productStock.iconUrl} />
              )}
              {productStock.qty <= 0 && (
                <View className='sold-out'>
                  <Text className='sold-out-text'>已售罄</Text>
                </View>
              )}
            </View>

            <View className='content'>
              <View className='price-wrap'>
                <View className='price'>{util.filterPrice(productStock.price)}</View>
              </View>
              <View className='qty'>库存{productStock.qty <= 0 ? '0' : productStock.qty}件</View>
              {isSelectedProduct ? (
                <View className='choice'>
                  已选择：
                  {Object.keys(productStock.info).map(infoItem => {
                    return infoItem === 'productId' ? '' : <Text key={infoItem}>"{productStock.info[infoItem]}"</Text>;
                  })}
                </View>
              ) : (
                <View className='choice'>{productStock.qty <= 0 ? '已售罄' : '请选择规格'}</View>
              )}
            </View>
          </View>
          <ScrollView
            className='select-content-box'
            scrollY
            style={{ height: Taro.pxTransform(windowHeight * 0.85 - 260 - 120) }}>
            <View className='specs-list'>
              {propertys.map((item: any, index: number) => {
                return (
                  <View className='specs-section' key={item.name}>
                    <View className='key'>{item.note}</View>
                    <View className='value'>
                      {item.valueList.map((value: string, vIndex: number) => {
                        return (
                          <View
                            className={`item ${item.selectIndex === vIndex ? 'selected' : ''}`}
                            key={value}
                            onClick={() => selectProperty(index, vIndex)}>
                            {value}
                          </View>
                        );
                      })}
                    </View>
                  </View>
                );
              })}
            </View>

            <View className='qty-wrap'>
              <View className='key'>数量</View>
              <QcInputNumber
                value={model.qty}
                min={productStock.minOrderQuantity}
                max={productStock.qty}
                onChange={(e: number) => {
                  setModel((prev: any) => {
                    return { ...prev, qty: e };
                  });
                }}
              />
            </View>
          </ScrollView>

          <View className='d-btn-wrap'>
            {(type === 'all' || type === 'add') && (
              <Button
                className='confirm add'
                // onClick={() => nowBuy('add')}
                openType='getUserInfo'
                loading={btnLoading}
                disabled={btnLoading}
                onGetUserInfo={async e => {
                  const {
                    detail: { userInfo }
                  } = e;
                  if (userInfo) {
                    if (!isSelectedProduct) {
                      util.showToast(`请选择规格`);
                      return;
                    }
                    if (sellout) {
                      util.showToast('已售罄，请选择其它规格');
                      return;
                    }
                    setBtnLoading(true);
                    await checkVisitor(e);
                    setBtnLoading(false);
                    nowBuy('add');
                  }
                }}>
                加入购物车
              </Button>
            )}
            {(type === 'all' || type === 'buy') && (
              <Button
                className='confirm buy'
                // onClick={() => nowBuy('buy')}
                openType='getUserInfo'
                loading={btnLoading}
                disabled={btnLoading}
                onGetUserInfo={async e => {
                  const {
                    detail: { userInfo }
                  } = e;
                  if (userInfo) {
                    if (!isSelectedProduct) {
                      util.showToast('请选择规格');
                      return;
                    }
                    if (sellout) {
                      util.showToast('已售罄，请选择其它规格');
                      return;
                    }
                    setBtnLoading(true);
                    await checkVisitor(e);
                    setBtnLoading(false);
                    nowBuy('buy');
                  }
                }}>
                立刻购买
              </Button>
            )}
          </View>
        </View>
      </Dialog>

      {/* 分享组件 */}
      <ShareWrap visible={shareVisible} onClose={() => setShareVisible(false)} onPoster={() => generatePoster()} />

      {/* 海报弹窗 */}
      <Dialog visible={posterVisible} position='center' onClose={() => setPosterVisible(false)}>
        <View className='poster-dialog'>
          <View className='poster-wrap'>
            <painter palette={template} onImgOK={handleImgOK} />
          </View>
          <Button type='primary' onClick={savePoster} loading={posterLoading}>
            {posterLoading ? '生成海报中...' : '保存到手机'}
          </Button>
        </View>
      </Dialog>
    </View>
  );
}

Index.config = {
  navigationBarTitleText: '商品详情',
  enablePullDownRefresh: true,
  usingComponents: {
    painter: '../../../components/Painter/painter'
  }
};
