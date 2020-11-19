import { useEffect, useState, useRef } from '@tarojs/taro';
import { View, Text } from '@tarojs/components';
import './index.scss';

function CountDown(props: any): JSX.Element {
  let dayTimeStamp: number = 86400000; // 一天的getTime()
  let hoursCount: number = 3600; // 一小时的秒数
  let minutesCount: number = 60; // 一分钟的秒数

  let {
    showText,
    showHour,
    showDay,
    time,
    endTime,
    className,
    style,
    styles,
    symbol,
    isClose,
    onTick,
    onEnd,
    color,
    onDay
  } = props;

  // 获取全部秒数
  const toCount = (time: number): number => parseInt(time / 1000 + '');

  // 获取剩余小时
  const toHours = (count: number): number => {
    return parseInt(count / hoursCount + '');
  };
  // 获取剩余分钟
  const toMinutes = (count: number): number => {
    let minutes = parseInt(count / minutesCount + '');
    if (minutes >= 60) minutes = minutes % minutesCount;
    return minutes;
  };
  // 获取剩余秒数
  const toSeconds = (count: number): number => {
    return count % minutesCount;
  };

  const timer: any = useRef();

  const [day, setDay] = useState(0);
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);

  const [count, setCount] = useState(0);
  const [start, setStart] = useState(false);

  // endTime
  useEffect(() => {
    console.log('useEffect count-down endTime', endTime);
    let time = 0;
    if (endTime) {
      console.log('============');
      if (isNaN(endTime)) {
        let dayCount = 0;
        let nowTimeCount = new Date().getTime();
        let endTimeCount = new Date(endTime.replace(/\-/g, '/')).getTime();
        time = endTimeCount > nowTimeCount ? endTimeCount - nowTimeCount : 0;
        if (showDay) dayCount = parseInt(time / dayTimeStamp + '');
        if (dayCount > 0) {
          time = time - dayCount * dayTimeStamp;
          setDay(dayCount);
        }
      } else {
        time = endTime;
      }
      setCount(Number(toCount(time)));
    }
  }, [endTime]);

  // count
  useEffect(() => {
    if (count > 0) {
      setStart(true);
      setTime();
      timer.current = setTimeout(() => {
        setCount(count => count - 1);
      }, 1000);
    } else {
      if (!start) return;
      setTime();
      if (day > 0) {
        setCount(Number(toCount(dayTimeStamp)));

        setTimeout(() => {
          setDay(day => day - 1);
          onDay && onDay(day - 1);
        }, 1000);
      } else {
        clearTimeout(timer.current);
        let nowTimeCount = new Date().getTime();
        let endTimeCount = new Date(endTime.replace(/\-/g, '/')).getTime();
        console.log('nowTimeCount =====>', nowTimeCount);
        console.log('endTimeCount =====>', endTimeCount);
        console.log('Math.abs(nowTimeCount - endTimeCount) < 1000', Math.abs(nowTimeCount - endTimeCount) < 1000);
        if (Math.abs(nowTimeCount - endTimeCount) < 1000) {
          start && onEnd && onEnd();
          console.log('count-down ======== onEnd');
        }
      }
    }
    return () => {
      clearTimeout(timer.current);
    };
  }, [count]);

  const countDownWorking = () => {};

  const setTime = () => {
    setHours(() => {
      return toHours(count);
    });
    setMinutes(() => {
      return toMinutes(count);
    });
    setSeconds(() => {
      return toSeconds(count);
    });
  };

  const renderTime = (val: number, type?: string) => {
    let count: string | number = val <= 9 ? `0${val}` : `${val}`;
    count = count === 'NaN' ? '00' : count;
    if (showDay && type === 'hours' && count == '24') count = '00';
    return <Text className='time'>{count}</Text>;
  };

  const countdownStyle = {
    color: color,
    ...style
  };
  let countdownClass = `box `;
  if (className) countdownClass += className;
  if (styles === 'text') countdownClass = 'text';

  return (
    <View className={countdownClass} style={countdownStyle}>
      {showHour && (
        <Text>
          {renderTime(hours, 'hours')}
          <Text className='dot'>{symbol}</Text>
        </Text>
      )}
      {renderTime(minutes)}
      <Text className='dot'>{symbol}</Text>
      {renderTime(seconds)}
    </View>
  );
}

CountDown.defaultProps = {
  showText: false, //  显示时分秒
  showDay: false, // 显示天数
  showHour: true, // 显示小时
  styles: '',
  symbol: ':',
  color: 'inherit', // 字体颜色
  isClose: false, // 手动关闭倒计时
  onTick: () => {}, // 倒计时过程事件
  onEnd: () => {}, //倒计时结束事件
  onDay: () => {} //天数改变事件
};

export default CountDown;
