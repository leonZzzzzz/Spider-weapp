import Taro, { useState, useEffect, usePullDownRefresh, useDidShow, useShareAppMessage } from '@tarojs/taro';
import { View, Text, Image, ScrollView, Button } from '@tarojs/components';
import './index.scss';
import util from '@/utils/util';
import api from '@/api';
import withShare from '@/utils/withShare';
import { IMG_HOST } from '@/config';
import { checkVisitor } from '@/utils/authorize';

import {
  LogoWrap,
  Dialog,
  ContentWrap,
  LoadingBox,
  ShareWrap,
  BottomBar,
  DividingLine,
  QcInputNumber
} from '@/components/common';
import {
  SwiperWrap,
  CantuanItem,
  SmallEvaluateItem,
  RecommendWrap,
  AssemblePriceWrap,
  BroadcastWrap
} from '@/components/mall';

import DrawImageData from './json';

export default function Index() {
  const [windowHeight] = useState(() => {
    const { windowHeight, windowWidth } = Taro.getSystemInfoSync();
    const screenK = windowWidth / 750;
    return windowHeight / screenK;
  });
  const [pageLoading, setPageLoading] = useState(true);
  const [btnLoading, setBtnLoading] = useState(false);
  const [organizeOrderId, setOrganizeOrderId] = useState('');
  const [query, setQuery] = useState<any>({});
  const [collected, setCollected] = useState(false); // 收藏
  const [model, setModel] = useState<any>({
    // 选择的商品信息
    id: '',
    qty: 1
  });
  const [product, setProduct] = useState<any>({
    // 商品信息
    qty: 1,
    enabledBuy: true,
    isSell: true
  });
  const [productSwiperItem, setProductSwiperItem] = useState<any[]>([]);
  const [productStock, setProductStock] = useState<any>({
    type: 'alone',
    price: 0,
    qty: 0,
    iconUrl: '',
    info: {}
  });
  const [propertys, setPropertys] = useState<any[]>([]);
  const [isSelectedProduct, setIsSelectedProduct] = useState(false);
  const [sellout, setSellout] = useState(false);
  const [broadcast, setBroadcast] = useState<any>({});
  const [joinGroup, setJoinGroup] = useState<any>({});
  const [joinGroupList, setJoinGroupList] = useState<any[]>([]);
  const [specsVisible, setSpecsVisible] = useState(false);
  const [shareVisible, setShareVisible] = useState(false);
  const [posterVisible, setPosterVisible] = useState(false);
  const [posterLoading, setPosterLoading] = useState(true);
  const [posterUrl, setPosterUrl] = useState('');
  const [template, setTemplate] = useState<any>({});
  const [QRCodeUrl, setQRCodeUrl] = useState('');
  const [moreGroupVisible, setMoreGroupVisible] = useState(false);
  const [productList, setProductList] = useState<any[]>([]);
  const [productEvaluateInfo, setProductEvaluateInfo] = useState<any>({});
  const [productEvaluate, setProductEvaluate] = useState<any[]>([]);
  const [transportExpenses, setTransportExpenses] = useState<any>({});
  const [limit, setLimit] = useState<any>({});
  const [memberStatus, setMemberStatus] = useState('');

  const [searchData, setSearchData] = useState<any>({
    pageNum: 0,
    pageSize: 20,
    total: 0
  });
  const [isExpire, setIsExpire] = useState(false); // 时间到
  const [isTimer, setIsTimer] = useState(false);
  let broadcastList = [];

  useEffect(() => {
    Taro.hideShareMenu();
    console.log('$router.params', this.$router.params);
    initialize(this.$router.params);
  }, []);

  useDidShow(() => {
    if (query.groupShoppingId) {
      groupProductGet(query);
      listOrganizerOrder({ groupShoppingId: query.groupShoppingId });
    }
  });
  usePullDownRefresh(() => {
    groupProductGet(query);
    listOrganizerOrder({ groupShoppingId: query.groupShoppingId });
  });

  useEffect(() => {
    console.log('useEffect query', query);
    if (query.groupShoppingId) {
      groupProductGet(query);
      listOrganizerOrder({ groupShoppingId: query.groupShoppingId });
      groupProductPage(query.groupShoppingId);
    }
  }, [query]);

  const initialize = async (params: any) => {
    let model = {
      storeId: Taro.getStorageSync('storeId'),
      groupShoppingId: params.id
    };
    searchData.groupShoppingId = params.id;
    setSearchData(searchData);
    setOrganizeOrderId(params.organizeOrderId);

    if (params.scene) {
      const sceneData = await sceneWxQRCode(params.scene);
      model.groupShoppingId = sceneData.id;
    }
    setQuery(model);
  };
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
      path: `/pagesMall/group-product/detail/index?id=${query.groupShoppingId}`
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
   * 获取团购商品详情
   * @param groupShoppingId 团购商品id
   * @param storeId 门店id
   */
  const groupProductGet = async (params: any) => {
    const res = await api.groupProductGet(params);
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

    setCollected(data.collected);
    setProductSwiperItem(imgList);
    setProduct(data.product);
    setPropertys(propertys);
    setTransportExpenses(data.transportExpenses);

    setProductStock({
      type: 'alone',
      info: {},
      price: data.product.price,
      vipPrice: data.product.vipPrice,
      groupPrice: data.product.groupPrice,
      groupOrganizerPrice: data.product.groupOrganizerPrice,
      qty: data.product.qty,
      iconUrl: data.product.iconUrl
    });

    if (propertys.length === choiceProp) {
      getProductStock(propertys);
    }
    setPageLoading(false);
    getProductEvaluateInfo(data.product.id);
    getChosenEvaluate(data.product.id);
    listOrganizer();

    const authorize = Taro.getStorageSync('authorize');
    if (authorize.memberId) groupProductLeftQuantity(params.groupShoppingId);
    Taro.stopPullDownRefresh();
  };

  /**
   * 剩余可拼团次数
   */
  const groupProductLeftQuantity = async (groupShoppingId: string) => {
    let res = await api.groupProductLeftQuantity({ groupShoppingId });
    setLimit(res.data.data);
  };

  /**
   * 发起的拼团订单
   * @param params groupShoppingId
   */
  const listOrganizerOrder = async (params: any) => {
    const res = await api.listOrganizerOrder(params);
    let data = res.data.data;
    if (data.list && data.list.length > 0) {
      let list = data.list.filter((item: any) => {
        if (new Date(item.expireTime.replace(/\-/g, '/')) > new Date()) return true;
        else return false;
      });
      data.list = list;
      data.quantity = list.length;
    }
    setJoinGroup(data);
    if (data.quantity > 0) {
      pageOrganizerOrder();
    }
  };
  /**
   * 发起的拼团订单(分页)
   * @param isLoadMore
   */
  const pageOrganizerOrder = async (isLoadMore?: boolean) => {
    if (isLoadMore) {
      searchData.pageNum++;
    } else {
      searchData.pageNum = 1;
    }
    const res = await api.pageOrganizerOrder(searchData);
    const data = res.data.data;
    setJoinGroupList([...joinGroupList, ...data.list]);
    setSearchData(searchData);
  };
  /**
   * 拼团订单轮播显示
   */
  const listOrganizer = async () => {
    const res = await api.listOrganizer();
    broadcastList = res.data.data;
    if (broadcastList.length > 0) {
      getBroadcast();
    }
  };

  const getBroadcast = () => {
    setTimeout(() => {
      console.log('------------ getBroadcast ----------');
      setBroadcast(broadcastList.shift());
      setTimeout(() => {
        setBroadcast({});
        if (broadcastList.length > 0 && isTimer) {
          getBroadcast();
        }
      }, 5000);
    }, 5000);
  };

  /**
   * 拼团商品列表
   */
  const groupProductPage = async (id: string) => {
    const res = await api.groupProductPage({ pageNum: 1, pageSize: 6, orderBy: 'salesQty', asc: 0 });
    let list = res.data.data.list.filter((item: any) => {
      return id !== item.groupShoppingId;
    });
    setProductList(list);
  };

  const handleBottom = () => {
    if (util.isHasNextPage(searchData, joinGroupList.length)) {
      pageOrganizerOrder(true);
    }
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
    getProductStock(propertys);
  };

  /**
   * 获取商品规格库存
   */
  const getProductStock = async (propertys: any[]) => {
    console.log('getProductStock propertys', propertys);
    let stockParams: any = {
      groupShoppingId: query.groupShoppingId
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

    let res = await api.groupProductStock(stockParams);
    let data = res.data.data;
    // data.qty = 0;
    setProductStock({
      type: productStock.type,
      info: stockParams,
      price: data.price,
      vipPrice: data.vipPrice,
      groupPrice: data.groupPrice,
      groupOrganizerPrice: data.groupOrganizerPrice,
      qty: data.qty,
      iconUrl: data.iconUrl
    });

    setModel((prevState: any) => {
      return { ...prevState, id: data.id, groupShoppingItemId: data.groupShoppingItemId };
    });
    // setIsSelectedProduct(data.qty > 0 ? true : false);
    setIsSelectedProduct(true);
    setSellout(data.qty > 0 ? false : true);
  };

  /**
   * 团购
   */
  const handleGroupBuy = async () => {
    if (isExpire) {
      util.showToast('拼团活动已结束，请选择其他拼团商品');
      return;
    }
    if (limit.isLimited && limit.leftQuantity === 0) {
      util.showToast('超过拼团限购次数');
      return;
    }

    console.log('handleGroupBuy', organizeOrderId);
    if (!isSelectedProduct) {
      util.showToast('请选择规格');
      return;
    }
    setSpecsVisible(false);
    setIsTimer(false);
    util.navigateTo(
      `/pagesMall/confirm-order/index?id=${model.groupShoppingItemId}&type=group&organizeOrderId=${organizeOrderId ||
        ''}`
    );
  };

  const nowBuy = async () => {
    if (!isSelectedProduct) {
      util.showToast('请选择规格');
      return;
    }
    let params = {
      ...model,
      storeId: product.storeId
      // wxMiniFormId: e.detail.formId
    };
    const res = await api.nowBuy(params);
    setSpecsVisible(false);
    setIsTimer(false);
    util.navigateTo(`/pagesMall/confirm-order/index?id=${res.data.data.id}`);
  };

  // 点击购买
  const handleBuyType = (type: string, joinId: string) => {
    console.log('handleBuyType', type, joinId);
    if (type === 'group') {
      if (limit.isLimited && limit.leftQuantity === 0) {
        util.showToast('超过拼团限购次数');
        return;
      }
      if (isExpire) {
        util.showToast('拼团活动已结束，请选择其他拼团商品');
        return;
      }
    }

    if (moreGroupVisible) setMoreGroupVisible(false);
    if (joinId) setOrganizeOrderId(joinId);
    productStock.type = type;
    setProductStock(productStock);
    setSpecsVisible(true);
  };
  useEffect(() => {
    console.log('setOrganizeOrderId', organizeOrderId);
  }, [organizeOrderId]);

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
        const res = await api.getWxQRCode({ sourceId: query.groupShoppingId, name: 'groupProduct' });
        console.log(res.data);
        _QRCodeUrl = res.data.message;
        setQRCodeUrl(_QRCodeUrl);
      }
      console.log('_QRCodeUrl ===========', _QRCodeUrl);
      console.log('organizeOrderId ===========', organizeOrderId);
      setTemplate(new DrawImageData().palette(product, organizeOrderId, memberInfo, _QRCodeUrl));
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
        {broadcast.groupShoppingId && <BroadcastWrap item={broadcast} />}

        {productSwiperItem && <SwiperWrap swiperData={productSwiperItem} isDetail={true} />}

        {product.id && (
          <AssemblePriceWrap
            price={organizeOrderId ? product.groupPrice : product.groupOrganizerPrice}
            endTime={product.groupEndTime}
            num={product.groupQuantity}
            onEnd={() => setIsExpire(true)}
          />
        )}

        <View className='title-wrap'>
          <View className='top'>
            <View className='left'>
              <View className='title'>{product.name}</View>
              <View className='price-wrap'>
                <Text className='price'>
                  {util.filterPrice(memberStatus === 'vip_member' ? product.vipPrice : product.price)}
                </Text>
                {/* <Text className='origin-price'>￥{util.filterPrice(product.origPrice)}</Text> */}
              </View>
            </View>
            <View className='right' onClick={handleLike}>
              <Text className={`qcfont ${collected ? 'qc-icon-like' : 'qc-icon-like-o'}`}></Text>
              <Text>喜欢</Text>
            </View>
          </View>

          {/* {memberStatus !== 'vip_member' &&
            <OpenVip />
          } */}
          {!product.isVirtual && (
            <View className='bottom'>
              {transportExpenses && transportExpenses.amount > 0 ? (
                <View className='kuai'>
                  快递：{util.filterPrice(transportExpenses.amount)}元，满
                  {util.filterPrice(transportExpenses.freeAmount)}元包邮，满{transportExpenses.freeQuantity}件包邮
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
                  return infoItem === 'groupShoppingId' ? (
                    ''
                  ) : (
                    <Text key={infoItem}>"{productStock.info[infoItem]}"</Text>
                  );
                })}
              </Text>
            ) : (
              <Text className='black'>请选择规格</Text>
            )}

            <Text className='qcfont qc-icon-chevron-right'></Text>
          </View>
        </View>

        {joinGroup.quantity && joinGroup.quantity > 0 && (
          <View>
            <View className='desc-wrap'>
              <Text>邀请组图，满员成功，不满员自动退款</Text>
              <Text className='qcfont qc-icon-gengduo'></Text>
            </View>

            <View className='pindan-wrap'>
              <View className='p-title'>
                <View className='title'>
                  <Text className='num'>{joinGroup.quantity}</Text>
                  <Text>人正在拼单，可直接参与</Text>
                </View>
                <View className='more' onClick={() => setMoreGroupVisible(true)}>
                  <Text>更多</Text>
                  <Text className='qcfont qc-icon-chevron-right'></Text>
                </View>
              </View>
              <View>
                {joinGroup.list.map((item: any, index: number) => {
                  return (
                    <CantuanItem
                      item={item}
                      index={index}
                      key={item.id}
                      onJoin={handleBuyType}
                      onCountDownEnd={() => listOrganizerOrder({ groupShoppingId: query.id })}
                    />
                  );
                })}
              </View>
            </View>
          </View>
        )}

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

        {productList.length > 0 && (
          <View>
            <DividingLine />
            <RecommendWrap list={productList} url='/pagesMall/group-product/index/index' title='大家都在拼' />
          </View>
        )}
      </View>

      <LogoWrap bottom={110} />

      <BottomBar showPraise={false} showComment={false} isPoster={true} onShare={() => setShareVisible(true)}>
        <View className='right-btn-wrap'>
          <Button className='alone' onClick={() => handleBuyType('alone', '')}>
            <View>
              ￥{util.filterPrice(memberStatus === 'vip_member' ? productStock.vipPrice : productStock.price)}
            </View>
            <View>单独购买</View>
          </Button>

          <Button
            className={`group ${limit.isLimited && limit.leftQuantity === 0 ? 'disabled' : ''}`}
            onClick={() => handleBuyType('group', '')}>
            <View>
              ￥{util.filterPrice(organizeOrderId ? productStock.groupPrice : productStock.groupOrganizerPrice)}
            </View>
            <View className='one'>{query.join ? '我要参团' : '一键开团'}</View>
          </Button>
        </View>
      </BottomBar>

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
                {productStock.type === 'group' ? (
                  <View className='price'>
                    {util.filterPrice(organizeOrderId ? productStock.groupPrice : productStock.groupOrganizerPrice)}
                  </View>
                ) : (
                  <View className='price'>
                    {util.filterPrice(memberStatus === 'vip_member' ? productStock.vipPrice : productStock.price)}
                  </View>
                )}
              </View>
              <View className='qty'>库存{productStock.qty <= 0 ? '0' : productStock.qty}件</View>
              {isSelectedProduct ? (
                <View className='choice'>
                  已选择：
                  {Object.keys(productStock.info).map(infoItem => {
                    return infoItem === 'groupShoppingId' ? (
                      ''
                    ) : (
                      <Text key={infoItem}>"{productStock.info[infoItem]}"</Text>
                    );
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
            {productStock.type === 'alone' && (
              <View className='qty-wrap'>
                <View className='key'>数量</View>
                <QcInputNumber
                  value={model.qty}
                  min={1}
                  max={productStock.qty}
                  onChange={(e: number) => {
                    setModel((prev: any) => {
                      return { ...prev, qty: e };
                    });
                  }}
                />
              </View>
            )}
          </ScrollView>

          <View className='d-btn-wrap'>
            {productStock.type === 'group' ? (
              <Button
                className='confirm'
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
                    handleGroupBuy();
                  }
                }}>
                确定
              </Button>
            ) : (
              <Button
                className='confirm'
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
                    nowBuy();
                  }
                }}>
                立即购买
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

      {/* 更多拼单弹窗 */}
      <Dialog
        visible={moreGroupVisible}
        position='center'
        isMaskClick={false}
        onClose={() => setMoreGroupVisible(false)}>
        <View className='more-group-dialog'>
          <View className='qcfont qc-icon-close' onClick={() => setMoreGroupVisible(false)}></View>
          <View className='d-title'>正在拼单</View>
          <ScrollView scrollY className='group-list' onScrollToLower={handleBottom}>
            {joinGroupList.map((item: any, index: number) => {
              return <CantuanItem item={item} index={index} key={item.id} type='page' onJoin={handleBuyType} />;
            })}
          </ScrollView>
        </View>
      </Dialog>
    </View>
  );
}

Index.config = {
  navigationBarTitleText: '拼团商品详情',
  enablePullDownRefresh: true,
  usingComponents: {
    painter: '../../../components/Painter/painter'
  }
};
