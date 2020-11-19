import { View, Image, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import './index.scss'

import { IMG_HOST } from '@/config'
import util from '@/utils/util'


function AfterSalesOrderItem(props: any) {

  let { item } = props

  // 对应状态颜色
  const orderStatus = {
    // 退货
    '1': '#fe4838',
    // 换货
    '2': '#fe4838',
    // 退款
    '3': '#fe4838',
  }

  const handleCopyOrderNo = () => {
    Taro.setClipboardData({
      data: item.number,
    }).then(res => {
      console.log('res :', res);
    });
  }

  return (
    <View className="order-list__item">
      <View className="title">
        <View className="num">
          <Text>售后单号：</Text>
          <Text className="num-text" onLongPress={handleCopyOrderNo}>
            {item.number}
          </Text>
        </View>
        <View className="status" style={`color:${orderStatus[item.serviceTypeValue]}`}>
          {item.serviceType}
        </View>
      </View>
      {item.items && item.items.length &&
        <View className="product-list">
          {item.items.map((product: any) => {
            return (
              <View className="product-info" key={product.productId}>
                <View
                  className="cover"
                  onClick={() => util.navigateTo(`/pagesMall/product-detail/index?id=${product.productId}`)}
                >
                  {product.icon && (
                    <Image className="img" mode="aspectFill" src={IMG_HOST + product.icon} />
                  )}
                </View>
                <View className="info">
                  <View className="info__name">{product.name}</View>
                  <View className="info__specs">{product.spec}</View>
                  <View className="info__price">
                    <View className="price">￥{util.filterPrice(product.price)}</View>
                    <View className="qty">x{product.quantity}</View>
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      }
      <View className="statistics">
        <View className="qty">
          <Text>共{item.totalQuantity}件商品</Text>
        </View>
        <View className="amount">
          <Text className="m-r-1">订单金额</Text>
          <Text>￥{util.filterPrice(item.totalAmount)}</Text>
        </View>
      </View>
      <View className="status-info">
        <View className="iconfont icon-guanyu" />
        <View className="text">{item.status}</View>
      </View>
      <View className="action">
        <View className="btn-wrapper">
          <View
            className="action-btn"
            onClick={() => util.navigateTo(`/pagesMall/after-sale/detail/index?id=${item.id}`)}
          >
            查看详情
          </View>
        </View>
      </View>
    </View>
  )
}

AfterSalesOrderItem.defaultProps = {
  item: {},
}

export default AfterSalesOrderItem
