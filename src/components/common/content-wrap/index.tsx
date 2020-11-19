import { View } from '@tarojs/components';
import './index.scss';

import ParserRichText from '../../ParserRichText/parserRichText';
import { useState, useEffect } from '@tarojs/taro';

function ContentWrap(props: any): JSX.Element {
  let { title, content, background, styles } = props;

  const [detail, setDetail] = useState('');

  const [screenWidth] = useState(() => Taro.getSystemInfoSync().screenWidth);

  useEffect(() => {
    if (content) {
      setDetail(contentReset(content));
    }
  }, [content]);

  const contentReset = (content: string) => {
    let contentList = content.split('width: ');
    contentList.map((item: any, i) => {
      if (i > 0) {
        let index = item.search(/\D/);
        if (item[index] === 'p') {
          if (item.split('px')[0] > screenWidth) {
            let arr = item.split('px');
            arr[0] = '100%';
            item = '';
            arr.map((label: any, i: number) => {
              if (i === 0) {
                item = item + label;
              } else {
                item = item + label + 'px';
              }
            });
            contentList[i] = item;
          }
        }
      }
    });
    content = '';
    contentList.map(item => {
      content = content + item + 'width: ';
    });
    content = content.substring(0, content.length - 7);
    content = content.replace(/<img/g, '<img style="width: 100%"');
    content = content.replace(/<embed/g, '<embed style="width: 100%"');
    content = content.replace(/<video/g, '<video style="width: 100% !important; display: block !important;"');
    return content;
  };

  return (
    <View className={`content-wrap ${background ? 'white' : ''}`}>
      {title && <View className='title'>{title}</View>}

      <View className='content-text' style={styles}>
        {/* <wxparser richText={content} /> */}
        <ParserRichText html={detail} show-with-animation animation-duration='500' selectable />
      </View>
    </View>
  );
}

ContentWrap.defaultProps = {
  title: '',
  content: '',
  background: true
};

// ContentWrap.config = {
//   usingComponents: {
//     'wxparser': 'plugin://wxparserPlugin/wxparser'
//   }
// }

export default ContentWrap;
