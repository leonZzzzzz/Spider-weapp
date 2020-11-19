import Taro from '@tarojs/taro'
import { View, Text } from '@tarojs/components'

import { Avatar } from '@/components/common'
// import Avatar from '@/components/common/avatar'


import './index.scss'

export default function CommentItem(props: any) {

  const { item, index, onReply } = props

  const handleReply = () => {
    onReply(true, item)
  }

  return (
    <View className={`comment-item ${index > 0 ? 'comment-line' : ''}`}>
      <View className="cover">
        <Avatar imgUrl={item.memberHeadImage} width={80} style={{border: '1px solid #bbbbbb'}} />
      </View>
      <View className="content-wrap">
        <View className="name">
          <Text>{item.nickName}</Text>
          <Text className="reply" onClick={handleReply}>回复</Text>
        </View>
        {item.createTime &&
          <View className="time">{item.createTime.substring(0, item.createTime.length - 3)}</View>
        }
        <View>{item.content}</View>
        {item.subComments && item.subComments.length && 
          <View className="reply-wrap">
            {item.subComments.map((reply: any) => {
              return (
                <View className="reply-item" key={reply.id}>
                  <View className="reply-name">{reply.memberName}：</View>
                  <View className="reply-content">{reply.content}</View>
                </View>
              )
            })}
          </View>
        }
      </View>
    </View>
  )
}

CommentItem.options = {
  addGlobalClass: true
}

CommentItem.defaultProps = {
  item: {},
}