import { View, Text, Picker, Button, Block,  } from '@tarojs/components';
import Taro, { useState, useEffect, useDidShow } from '@tarojs/taro';
import './index.scss';

import { LogoWrap, LoadingBox } from '@/components/common';
import { AtSearchBar } from 'taro-ui'

import api from '@/api/cowebs';

export default function TagEdit() {
  const [pageLoading, setPageLoading] = useState(true);
  // const [member, setMember] = useState<any>({});
  const [searchValue, setSearchValue] = useState<string>('');
  const [personalityLabel, setPersonalityLabel] = useState<any[]>([
    {  id: '1', name: '70后' },
    {  id: '2', name: '80后' },
  ])
  const [myPersonalityLabel, setMyPersonalityLabel] = useState<any[]>([
    {  id: '1', name: '70后' },
    {  id: '2', name: '80后' },
  ])

  useDidShow(() => {
    getMyPersonalityTag()
    pagePersonalityTag()
  })

  const getMyPersonalityTag = async () => {
    const res = await api.myPersonalityTag({pageNum: 1, pageSize: 100})
    setPageLoading(false)
    setMyPersonalityLabel(res.data.data.list)
  }

  const pagePersonalityTag = async (name?: string ) => {
    try {
      const res = await api.pagePersonalityTag({name: name || ''})
      Taro.hideLoading()
      setPersonalityLabel(res.data.data.list)
    } catch (error) {
      Taro.hideLoading()
    }
  }

  const addTags = async (tag: any) => {
    try {
      // if (myPersonalityLabel.length >= 3) {
      //   Taro.showToast({title: '最多只能设置三个标签', icon: 'none'})
      //   return false
      // }
      if (tag.id) {
        if (myPersonalityLabel.some(item => item.id === tag.id)) {
          Taro.showToast({title: '标签已存在，不可重复添加', icon: 'none'})
          return false
        }
      }
      Taro.showLoading({title: 'loading'})
      await api.addPersonalityTag({ templateId: tag.id })
      Taro.hideLoading()
      myPersonalityLabel.push(tag)
      setMyPersonalityLabel(JSON.parse(JSON.stringify(myPersonalityLabel)))
    } catch (error) {
      console.log(error)
      error.data && Taro.showToast({title: error.data.message || '添加失败', icon: 'none'})
    }
  };

  const deleteTags = async (id: string) => {
    try{
      Taro.showLoading({title: 'loading'})
      await api.delPersonalityTag({ id: id })
      Taro.hideLoading()
      myPersonalityLabel.splice(myPersonalityLabel.findIndex(item => item.id === id), 1)
      setMyPersonalityLabel(JSON.parse(JSON.stringify(myPersonalityLabel)))
    } catch (error) {
      console.log(error)
      Taro.showToast({title: '删除失败', icon: 'none'})
    }
  };

  const handleSearch = () => {
    Taro.showLoading({title: 'loading'})
    pagePersonalityTag(searchValue)
  }

  const handleClear = () => {
    setSearchValue('')
    Taro.showLoading({title: 'loading'})
    pagePersonalityTag('')
  }

  const handleSearchChange = (value: any) => {
    setSearchValue(value)
  }

  return (
    <View className='tag-edit'>
      <LoadingBox visible={pageLoading} />
      <View className='tag-wrap'>
        <View className='my-tag'>
          <View className='label-title'>我的标签</View>
          {/* 个性标签 */}
          <View className="my-tags">
            {myPersonalityLabel.map((tag: any) => {
              return <Text key={tag.id} className="tag" onClick={ () => deleteTags(tag.id)}>{tag.name} x</Text>
            })}
          </View>
        </View>

        <View className='stystem-tag'>
          <View className='label-title'>添加标签 
            <Text className="label-title-tips">点击标签添加</Text>
          </View>
          <AtSearchBar 
            value={searchValue}
            onClear={handleClear}
            onChange={handleSearchChange}
            onActionClick={handleSearch}
            onConfirm={handleSearch}
            placeholder='搜索标签'
            className='search-bar'
          />
          {/* 个性标签 */}
          <View className="stystem-tags">
            {personalityLabel.map((tag: any) => {
              return <Text key={tag.id} className="tag" onClick={ () => addTags(tag)}>{tag.name}</Text>
            })}
          </View>
        </View>
      </View>
      <View className='save-btn-bar'></View>
      <LogoWrap />
      <View className='save-btn'>
        <Button onClick={() => Taro.navigateBack()}>
          返回
        </Button>
      </View>
    </View>
  )
}

TagEdit.config = {
  navigationBarTitleText: '添加标签'
};