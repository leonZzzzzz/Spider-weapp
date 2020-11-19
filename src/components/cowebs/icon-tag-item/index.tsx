import { View, Text } from '@tarojs/components'
import './index.scss'

function IconTagItem(props: any) {
  const { item, index, type, onDelete, style } = props

  const handleDelete = () => {
    onDelete && onDelete(index)
  }

  return (
    <View className="icon-tag-item" style={style}>
      <Text className={`qcfont ${item.icon}`} style={style} />
      <Text>{item.title}</Text>
      {type === 'delete' &&
        <Text className="qc-icon-jian qcfont delete" onClick={handleDelete} />
      }
    </View>
  )
}

IconTagItem.defaultProps = {
  item: {},
  type: '',
}

IconTagItem.options = {
  addGlobalClass: true
}

export default IconTagItem