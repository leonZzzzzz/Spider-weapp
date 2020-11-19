import Taro, { useState, useEffect } from '@tarojs/taro';
import { View, Video, Block, CoverView } from '@tarojs/components'
import './index.scss'
import Utils from '@/utils/util'
import { getVideoDetail } from '@/api/flywheel'

export default function QcVideo(props) {

  const { options }:any = props;
  const [detail, setDetail] = useState<any>({})

  useEffect(() => {
    if (options.info && options.info.fileId) {
      // 上传到腾讯云的，需要用fileId去获取播放url
      getDetail()
    } else {
      // 直接放视频链接的
      setDetail({
        id: Utils.getNewId(),
        src: options.info.videoUrl
      })
    }
  }, [])

  // 视频数据
  const getDetail = async () => {
    console.log('getVideoDetail 调用')
    try {
      const res = await getVideoDetail({fileId: options.info.fileId});
      let data = res.data.data
      setDetail(() => {
        return {
          ...data,
          src: data.file.url + data.playSignature.queryString
        }
      })
    } catch(err) {
      console.log('getVideoDetail err', err)
    }
  }

  const playVideo = () => {
    Taro.createVideoContext(detail.id || detail.file ? detail.file.id : options.info.fileId, this)
  }

  const file = detail.file || {}
  const wrapStyle = { paddingLeft: options.paddingLeftAndRight * 2 + 'rpx', paddingRight: options.paddingLeftAndRight * 2 + 'rpx' };
  const style = { height: file.height ? Math.min(file.height, 200) * 2 +'rpx' : 320+'rpx', borderRadius: options.borderRadius * 2 + 'rpx', };

  return (
    <Block>
    {detail.src && (
      <View className="qc-video relative" style={wrapStyle}>
        <Video 
          className='qc-video__video'
          id={detail.id || detail.file ? detail.file.id : options.info.fileId}
          src={detail.src}
          objectFit='cover'
          showMuteBtn={true}
          showCenterPlayBtn={true}
          style={style}
          onError={(e) => {
            console.log('视频播放出错==》', e)
          }}
        ></Video>
        {false && <CoverView className="qcfont qc-icon-bofang1" onClick={playVideo}></CoverView>}
      </View>
    )}
    </Block>
  )
}

QcVideo.defaultProps = {
  // info说明
  //  {
  //   fileId: string,
  //   videoUrl: string,
  //   coverUrl: string
  // }
  options: {
    info: {},
    borderRadius: 10,
    paddingLeftAndRight: 15,
  }
}
QcVideo.options = {
  addGlobalClass: true
}
