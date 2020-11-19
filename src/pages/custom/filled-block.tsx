import { View, Block } from '@tarojs/components';

export default function FilledBlock({ config }) {
  return (
    <Block>
      {config.isHeaderColor && (
        <View
          style={`height: ${config.height}rpx;background: ${config.themeColor};position: absolute;top: 0;left: 0;right: 0;`}></View>
      )}
    </Block>
  );
}
