import { OfficialAccount, View, Block } from '@tarojs/components';
import { useState } from '@tarojs/taro';

function QcOfficialAccount() {
  const [status, setStatus] = useState(0);
  return (
    <Block>
      {status == 0 && (
        <View style='margin: 15px;display:block'>
          <OfficialAccount
            onError={e => {
              setStatus(e.detail.status);
            }}
            onLoad={e => {
              setStatus(e.detail.status);
            }}></OfficialAccount>
        </View>
      )}
    </Block>
  );
}

export default QcOfficialAccount;
