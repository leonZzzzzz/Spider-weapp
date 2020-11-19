import Taro, { useState, useEffect, useRouter } from '@tarojs/taro'
import { View, Text, Image, Button, Form } from '@tarojs/components'
import './index.scss'
import util from '@/utils/util'
import api from '@/api/mall'
import { IMG_HOST } from '@/config';

import { LogoWrap, Dialog, ContentWrap, LoadingBox, BottomBar, AuthorizeWrap } from '@/components/common'
import { SwiperWrap, AssemblePriceWrap } from '@/components/mall'

export default function Index() {

  const [ authorizeVisible, setAuthorizeVisible ] = useState(false)
  const [ pageLoading, setPageLoading ] = useState(true)
  const [ query, setQuery ] = useState<any>({})
  const [ model, setModel ] = useState<any>({  // 选择的商品信息
    id: '',
    qty: 1,
  })
  const [ product, setProduct ] = useState<any>({  // 商品信息
    qty: 1,
    enabledBuy: true,
    isSell: true,
  })
  const [ productSwiperItem, setProductSwiperItem ] = useState<any[]>([])
  const [ productStock, setProductStock ] = useState<any>({
    type: 'alone',
    price: 0,
    qty: 0,
    helpQuantity: 0,
    iconUrl: '',
    info: {},
  })
  const [ propertys, setPropertys ] = useState<any[]>([])
  const [ isSelectedProduct, setIsSelectedProduct ] = useState(false)
  const [ specsVisible, setSpecsVisible ] = useState(false)
  const [ isExpire, setIsExpire ] = useState(false) // 时间到

  const params = useRouter().params
  
  useEffect(() => {
    Taro.hideShareMenu()

    let _params = JSON.parse(JSON.stringify(params))
    _params.id = _params.id || _params.scene
    const storeId = Taro.getStorageSync('storeId')
    setQuery(_params)
    const model: any = {
      storeId,
      helpShoppingId: _params.id
    }
    helpProductGet(model)

  }, [])


  /**
   * 获取助力商品详情
   * @param helpShoppingId 助力商品id
   * @param storeId 门店id
   */
  const helpProductGet = async (params: any) => {
    const res = await api.helpProductGet(params)
    console.log(res.data)
    let data = res.data.data
    // 处理轮播图数据
    let imgList = data.product.rollingImgUrl.split('_');
    imgList = imgList.map((item: string) => {
      return IMG_HOST + item
    });
    console.log('imgList', imgList)
    // 处理规格数据
    let choiceProp = 0;
    let propertys = data.propertyList.map(item => {
      // 如果每个规格列表都只有一个时则默认选择
      if (item.valueList.length === 1) {
        item.selectIndex = 0;
        choiceProp++;
      } else {
        item.selectIndex = '';
      }
      return item;
    });
    productStock.price = data.product.helpPrice;
    productStock.qty = data.product.qty;
    productStock.helpQuantity = data.product.qty;
    productStock.iconUrl = data.product.iconUrl;

    setProductSwiperItem(imgList)
    setProduct(data.product)
    setProductStock(productStock)
    setPropertys(propertys)
    if (propertys.length === choiceProp) {
      helpProductStock()
    }
    setPageLoading(false)
  }

  /**
   * 购买数量
   * @param val 数量
   */
  const onChangeQty = (val: number) => {
    model.qty = val
    setModel(model)
  }

  /**
   * 选择规格
   * @param index 规格下标
   * @param vIndex 规格子项下标
   */
  const selectProperty = (index: number, vIndex: number) => {
    propertys[index].selectIndex = vIndex;
    model.qty = 1;
    setModel(model)
    setPropertys(propertys)
    helpProductStock()
  }

  /**
   * 获取商品规格库存
   */
  const helpProductStock = async () => {
    const params: any = {
      helpShoppingId: query.id
    }

    for (let i = 0; i < propertys.length; i++) {
      let index = propertys[i].selectIndex;
      // 未选择对应的规格
      if (index === '') {
        return;
      } else {
        let value = propertys[i].valueList[index];
        params[`spec${i + 1}Value`] = value;
      }
    }
    // 设置选择的商品规格信息
    productStock.info = params

    let res = await api.helpProductStock(params)
    let data = res.data.data
    productStock.price = data.helpPrice;
    productStock.qty = data.qty;
    productStock.helpQuantity = data.helpQuantity;
    productStock.iconUrl = data.iconUrl;
    model.helpShoppingItemId = data.helpShoppingItemId
    let status = data.helpQuantity > 0 ? true : false;
    setModel(model)
    setIsSelectedProduct(status)
    setProductStock(productStock)
  }


  /**
   * 助力购
   */
  const handleHelpBuy = async () => {
    if (isExpire) {
      util.showToast('助力活动已结束，请选择其他助力商品')
      return
    }

    if (util.checkAuthorize()) {
      setAuthorizeVisible(true)
      return 
    }

    if (!isSelectedProduct) {
      this.showToast('请选择规格')
      return
    }
    setSpecsVisible(false)
    util.navigateTo(`/pagesMall/confirm-order/index?id=${model.helpShoppingItemId}&type=help`)
  }


  return (
    <View className="group-product-detail">

      <LoadingBox visible={pageLoading} />

      <View className="relative">
        {isExpire &&
          <View className="expire-wrap">
            <Image className="img" mode="widthFix" src={`${IMG_HOST}/attachments/images/zljs.png`} />
          </View>
        }

        {productSwiperItem &&
          <SwiperWrap swiperData={productSwiperItem} isDetail={true} />
        }
        
        <AssemblePriceWrap price={product.helpPrice} endTime={product.helpEndTime} num={product.helpQuantity} origPrice={product.price} tag="好友助力" onEnd={() => setIsExpire(true)} />

        <View className="title-wrap">
          <View className="top">
            <View className="left">
              <View className="title">{product.name}</View>
            </View>
          </View>
          
        </View>

        <View className="specs-wrap">
          <View className="unit">规格</View>
          <View className="value" onClick={() => setSpecsVisible(true)}>
            {isSelectedProduct ? (
              <Text className="black">
                已选择：
                {Object.keys(productStock.info).map(infoItem => {
                  return infoItem === 'helpShoppingId' ? '' : <Text key={infoItem}>"{productStock.info[infoItem]}"</Text>;
                })}
              </Text>
            ) : (
              <Text className="black">请选择规格</Text>
            )}

            <Text className="qcfont qc-icon-chevron-right"></Text>
          </View>
        </View>

        <View className="desc-wrap">
          <Text>邀请好友助力，满员成功，不满员自动退款</Text>
          <Text className="qcfont qc-icon-gengduo"></Text>
        </View>

        <ContentWrap title="商品详情" content={product.content} />

      </View>

      <LogoWrap bottom={110} />

      <BottomBar showPraise={false} showComment={false} showShare={false}>
        <View className="right-btn-wrap">
          <View className="alone" hoverClass="alone-active" onClick={() => setSpecsVisible(true)}>
            <View>立即购买</View>
          </View>
        </View>
      </BottomBar>


      {/* 选择规格购买弹窗 */}
      <Dialog
        visible={specsVisible}
        position="bottom"
        isMaskClick={false}
        onClose={() => setSpecsVisible(false)}
      >
  
        <View className="assemble-dialog">
          <View className="close" onClick={() => setSpecsVisible(false)}>
            <Text className="qcfont qc-icon-close"></Text>
          </View>
          <View className="info-section">
            <View className="cover">
              {productStock.iconUrl && (
                <Image className="img" mode="aspectFill" src={IMG_HOST + productStock.iconUrl} />
              )}
              {productStock.helpQuantity <= 0 && (
                <View className="sold-out">
                  <Text className="sold-out-text">已售罄</Text>
                </View>
              )}
            </View>
            <View className="content">
              <View className="price-wrap">
                <View className="price">{util.filterPrice(productStock.price)}</View>
              </View>
              <View className="qty">库存{productStock.helpQuantity <= 0 ? '0' : productStock.helpQuantity}件</View>
              {isSelectedProduct ? (
                <View className="choice">
                  已选择：
                  {Object.keys(productStock.info).map(infoItem => {
                    return infoItem === 'helpShoppingId' ? '' : <Text key={infoItem}>"{productStock.info[infoItem]}"</Text>
                  })}
                </View>
              ) : (
                <View className="choice">{productStock.helpQuantity <= 0 ? '已售罄' : '请选择规格'}</View>
              )}
            </View>
          </View>
          <View className="specs-list">
            {propertys.map((item: any, index: number) => {
              return (
                <View className="specs-section" key={item.name}>
                  <View className="key">{item.note}</View>
                  <View className="value">
                    {item.valueList.map((value: string, vIndex: number) => {
                      return (
                        <View 
                          className={`item ${item.selectIndex === vIndex ? 'selected' : ''}`}
                          key={value}
                          onClick={() => selectProperty(index, vIndex)}
                        >{value}</View>
                      )
                    })}
                  </View>
                </View>
              )
            })}
          </View>

          <View className="d-btn-wrap">
            <Form 
              reportSubmit onSubmit={handleHelpBuy}
              className="form-btn"
            >
              <Button className="confirm" hoverClass="confirm-active" formType="submit">立即购买</Button>
            </Form>
          </View>

        </View>
      </Dialog>

      <AuthorizeWrap visible={authorizeVisible} onHide={() => setAuthorizeVisible(false)} isClose={true} />
    </View>
  )
}


Index.config = {
  navigationBarTitleText: '助力商品详情',
}