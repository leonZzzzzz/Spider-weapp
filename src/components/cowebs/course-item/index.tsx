import Taro, { useState, useEffect } from '@tarojs/taro'
import { View, Image, Text, ScrollView } from '@tarojs/components'
import { IMG_HOST } from '@/config';
import util from '@/utils/util'
import './index.scss'

export default function CourseItem(props: any) {

  const { item, index, type } = props

  const [ screen ] = useState(() => Taro.getSystemInfoSync().screenWidth / 750)
  const [ widthScrollView1, setWidthScrollView1 ] = useState(0)

  useEffect(() => {
    if (item.id) {
      getScrollViewWidth()
    }
  }, [item])

  const getScrollViewWidth = () => {
    const query = Taro.createSelectorQuery().in(this.$scope)
    if (type === 'scrollX') {
      query.select('.price1').boundingClientRect()
      query.exec((res: any) => {
        // console.log(item.title, 372 - Math.round(res[0].width / screen))
        setWidthScrollView1(372 - Math.round(res[0].width / screen))
      })
    }
  }

  const navigateTo = () => {
    Taro.navigateTo({
      url: `/pagesCoWebs/course/detail/index?id=${item.id}`
    })
  }

  return ( type === 'scrollX' ?
    <View className={`course-item-scrollX ${index === 0 ? 'first' : ''}`} key={item.id} onClick={navigateTo}>
      <View className="course-box box-shadow">
        <View className='top'>
          <Image
            className='course-pic'
            mode="aspectFill"
            src={IMG_HOST + item.iconUrl}
          />
        </View>
        <View className='bottom'>
          <View className='course-title'>
            <Text selectable>{item.title}</Text>
          </View>
          <View className="time-price">
            <View className="price-wrap price1">
              {item.openPrepayment ?
                <Text className="price">{item.price}</Text>
                :
                <Text className="price">{util.filterPrice(item.advanceCharge)}</Text>
              }
            </View>
            {item.courseTagList && item.courseTagList.length > 0 &&
              <ScrollView style={{width: Taro.pxTransform(widthScrollView1)}} scrollX>
                <View className="tags" >
                  {item.courseTagList.map((tag: any) => {
                    return <Text key={tag.id} className="tag">{tag.name}</Text>
                  })}
                </View>
              </ScrollView>
            } 
            
          </View>
        </View>
      </View>
    </View>
    :
    <View className={`course-item ${index > 0 ? 'course-item-line' : ''}`} key={item.id} onClick={navigateTo}>
      <View className='course-item__cover'>
        <Image mode="aspectFill" src={IMG_HOST + item.iconUrl} />
      </View>
      <View className='course-item__title'>
        <Text selectable>{item.title}</Text>
      </View>
      {item.courseTagList && item.courseTagList.length > 0 &&
        <ScrollView style={{width: Taro.pxTransform(690)}} scrollX>
          <View className="tags" >
            {item.courseTagList.map((tag: any) => {
              return <Text key={tag.id} className="tag">{tag.name}</Text>
            })}
          </View>
        </ScrollView>
      } 
      <View className="desc-wrap">
        <View className="price-wrap">
          <Text>学费：</Text>
          {item.openPrepayment ?
            <Text className="price">{item.price}</Text>
            :
            <Text className="price">{util.filterPrice(item.advanceCharge)}</Text>
          }
        </View>
        <View className="time-wrap">
          <Text>学制：</Text>
          <Text className="time">{item.educationalSystem}</Text>
        </View>
      </View>
    </View>
  )
}

CourseItem.defaultProps = {
  item: {},
  type: '',
}

CourseItem.options = {
  addGlobalClass: true
}