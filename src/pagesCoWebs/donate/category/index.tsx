import Taro, { useState, useEffect, useDidShow, useRouter} from "@tarojs/taro";
import { View, ScrollView, Image } from "@tarojs/components";
import api from "@/api/donate";
import { IMG_HOST } from "@/config";
import Utils from "@/utils/util";
import "./index.scss";

interface Category {
  id: string;
  name: string;
}

export default function Category() {
  const { categoryId } = useRouter().params;
  const [categorys, setCategorys] = useState<Category[]>([]);
  // const [categoryId, setCategoryId] = useState<string>("");
  const [list, setList] = useState<any[]>([]);
  const [lock, setLock] = useState(false);
  const [search, setSearch] = useState({ pageSize: 20, pageNum: 1, categoryId: categoryId || ''});

  useDidShow(() => {
    Taro.showShareMenu({})
    getCategoryList();
  })

  useEffect(() => {
    return () => {
      // 清除
      Taro.removeStorage({key: 'categoryId'})
    };
  });

  useEffect(() => {
    send(search)
  }, [search])

  const onRefreshSearch = (params = {}) => {
    setList([])
    setSearch({ ...search, pageSize: 20, pageNum: 1, ...params });
  };

  const onScrollToLower = () => {
    console.log('组件的上拉加载')
    if (lock) {
      return;
    }
    setSearch(e => ({ ...e, pageNum: e.pageNum += 1 }));
  }

  const send = (params) => {
    api.donatePage(params).then(res => {
      if (res.data.data.list.length > 0) {
        setLock(false);
        if (params.pageNum === 1) setList(res.data.data.list)
        else setList(e => [...e, ...res.data.data.list]);
        setTimeout(() => {
          Taro.stopPullDownRefresh();
        }, 1000);
      } else {
        setLock(true);
        // Taro.showToast({title: '数据到底啦~', icon: 'none'})
      }
    });
  };

  const getCategoryList = async () => {
    const res = await api.getCategorys('4ae2f4aa23a9405982161f6bcd3870a3');
    setCategorys(res.data.data);
    Taro.stopPullDownRefresh()
  };

  const navigateTo = (item: any) => {
    Utils.navigateTo('/pagesCoWebs/donate/detail/index?id='+item.id)
  };

  return (
    <View className="category">
      <View className="category-fixed-wrap">
        <ScrollView scroll-y className="category-fixed-wrap__left">
          <View
            onClick={() => {
              onRefreshSearch({categoryId: ''})
            }}
            className={"" == search.categoryId ? "tab tab-active" : "tab"}
          >
            全部
          </View>
          {categorys.map(item => {
            return (
              <View
                onClick={() => {
                  onRefreshSearch({categoryId: item.id})
                }}
                className={item.id == search.categoryId ? "tab tab-active" : "tab"}
                key={item.id}
              >
                {item.name}
              </View>
            );
          })}
        </ScrollView>
        <ScrollView scroll-y className="category-fixed-wrap__right" lowerThreshold={80} onScrollToLower={onScrollToLower}>
          {list.map(item => {
            return (
              <View
                className="item"
                key={item.id}
                onClick={() => {
                  navigateTo(item);
                }}
              >
                <View className="item-img">
                  <Image src={IMG_HOST + item.cover} mode="aspectFill" />
                </View>
                <View className="item-name">{item.title}</View>
              </View>
            );
          })}
          {lock && <View className='relative no-more'>没有数据啦~</View>}
        </ScrollView>
      </View>
    </View>
  );
}

Category.config = {
  enablePullDownRefresh: true,
  navigationBarTitleText: '随喜乐捐'
};
