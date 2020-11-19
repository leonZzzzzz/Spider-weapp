import Taro, { useState, useEffect, usePullDownRefresh } from '@tarojs/taro';
import { View, Text, Button, Form, Input, ScrollView } from '@tarojs/components';
import './index.scss';

import api from '@/api/index';
import Utils from '@/utils/util';

import { Dialog } from '@/components/common';
import { CommentItem } from '@/components/cowebs';

function CommentWrap(props: any) {
  const { sourceId, sourceType, placeholder, isEnableCommentAudit, refresh } = props;
  const [commentQuantity, setCommentQuantity] = useState(0);
  const [commentList, setCommentList] = useState<any[]>([]);
  const [commentBtnLoading, setCommentBtnLoading] = useState(false);
  const [visibleComment, setVisibleComment] = useState(false);
  const [visibleFocus, setVisibleFocus] = useState(false);
  const [checkVisible, setCheckVisible] = useState(false);
  const [isall, setIsall] = useState(false);
  const [commentModel, setCommentModel] = useState<any>({
    sourceId: '',
    sourceType,
    content: '',
    parentId: '',
    placeholder
  });

  useEffect(() => {
    commentPage();

    Taro.eventCenter.on('commentPage', () => {
      commentPage();
    });

    Taro.eventCenter.on('handleComment', () => {
      handleComment(true);
    });

    return () => {
      Taro.eventCenter.off('commentPage');
      Taro.eventCenter.off('handleComment');
    };
  }, []);

  usePullDownRefresh(() => {
    commentPage();
  });

  const commentPage = async () => {
    const res = await api.commentPage({ sourceId });
    setCommentList(res.data.data.list);
    setCommentQuantity(res.data.data.total);
  };

  const sendComment = (e: any) => {
    // scrollComment();
    // return;
    if (!commentModel.content) {
      Taro.showToast({
        title: '请输入留言内容',
        icon: 'none'
      });
      return;
    }
    setCommentBtnLoading(true);
    Utils.showLoading(true, '发送中…');
    commentModel.wxMiniFormId = e.detail.formId;
    commentInsert(commentModel);
  };
  const commentInsert = async (params: any) => {
    try {
      const res = await api.commentInsert(params);
      console.log('commentInsert', res);
      Utils.showToast(`留言成功${isEnableCommentAudit ? '，请等待审核，审核后将显示' : ''}`);
      handleComment(false);
      commentPage();
      refresh && refresh();
      setCommentBtnLoading(false);
      if (!params.parentId) scrollComment();
    } catch (err) {
      setCommentBtnLoading(false);
      setCommentModel(prev => {
        return { ...prev, content: '' };
      });
    }
  };

  const scrollComment = () => {
    const query = Taro.createSelectorQuery().in(this.$scope);
    query.select('.comment-box').boundingClientRect();
    query.selectViewport().scrollOffset();
    query.exec(res => {
      console.log('scrollComment', res);
      if (res[0] && res[0].top) {
        const scrollTop = Math.ceil(res[0].top) + res[1].scrollTop - 10;
        Taro.pageScrollTo({
          scrollTop,
          duration: 200
        });
      }
    });
  };

  const handleComment = (state: boolean, item?: any) => {
    console.log('handleComment', state);
    if (state) {
      commentModel.sourceId = '';
      commentModel.parentId = '';
      commentModel.content = '';
      commentModel.placeholder = '开始您的精彩评论吧...';
      if (item && item.id) {
        commentModel.sourceId = item.sourceId;
        commentModel.parentId = item.id;
        commentModel.placeholder = `回复:${item.memberName}（不可大于64字）`;
      } else {
        commentModel.sourceId = sourceId;
      }
    }
    setVisibleComment(state);
    setCommentModel(commentModel);
    setTimeout(() => {
      setVisibleFocus(state);
    }, 100);
  };

  return (
    <View>
      {commentList.length > 0 && (
        <View className='comment-box'>
          {commentList.map((item: any, i: number) => {
            return (
              <Block>
                {isall ? (
                  <CommentItem item={item} index={i} key={item.id} onReply={() => handleComment(true, item)} />
                ) : (
                    i < 5 && <CommentItem item={item} index={i} key={item.id} onReply={() => handleComment(true, item)} />
                  )}
              </Block>
            );
          })}
          {commentList.length > 5 && (
            <View className='move' onClick={() => setIsall(true)}>
              <Text>· 查看全部{commentQuantity}条评论 ·</Text>
            </View>
          )}
        </View>
      )}

      {/* 发布评论 */}
      <Dialog visible={visibleComment} position='bottom' onClose={() => handleComment(false)}>
        <Form onSubmit={sendComment} reportSubmit>
          <View className='remark-box'>
            {visibleFocus && (
              <Input
                placeholder={commentModel.placeholder}
                cursorSpacing={15}
                maxLength={64}
                focus
                value={commentModel.content}
                onInput={e => {
                  setCommentModel(prev => {
                    return { ...prev, content: e.detail.value };
                  });
                }}
              />
            )}
            <Button className='send-btn' formType='submit' loading={commentBtnLoading}>
              {commentModel.parentId ? '回复' : '留言'}
            </Button>
          </View>
        </Form>
      </Dialog>

      {/* 查看评论 */}
      <Dialog visible={checkVisible} position='bottom' isMaskClick={false} onClose={() => setCheckVisible(false)}>
        <View className='check-comment-dialog'>
          <View className='qcfont qc-icon-guanbi1 close' onClick={() => setCheckVisible(false)}></View>
          <View className='title'>共{commentQuantity}条评论</View>

          <ScrollView className='scroll' scrollY>
            <View className='list'>
              {commentList.length > 0 &&
                commentList.map((item: any, index: number) => {
                  return (
                    <CommentItem item={item} index={index} key={item.id} onReply={() => handleComment(true, item)} />
                  );
                })}
            </View>
          </ScrollView>
        </View>
      </Dialog>
    </View>
  );
}

CommentWrap.defaultProps = {
  placeholder: '开始您的精彩评论吧...',
  sourceType: '',
  isEnableCommentAudit: false
};

export default CommentWrap;
