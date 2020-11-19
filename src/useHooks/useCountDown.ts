import { useState, useEffect, useRef } from '@tarojs/taro'

const useCountDown = (time?: any) => {
  const [ endTime, setEndTime ] = useState(() => time)
  const [ dayTimeStamp ] = useState(86400000) // 一天的getTime()
  const [ hoursCount ] = useState(3600) // 一小时的秒数
  const [ minutesCount ] = useState(60) // 一分钟的秒数
  const [ end, setEnd ] = useState(false)

  // 获取全部秒数
  const toCount = (time: number): number => parseInt(time / 1000 + '')

  // 获取剩余小时
  const toHours = (count: number): any => {
    const num = parseInt((count / hoursCount) + '')
    return num < 10 ? '0' + num : num
  }
  // 获取剩余分钟
  const toMinutes = (count: number): any => {
    let minutes = parseInt((count / minutesCount) + '')
    if (minutes >= 60) minutes = minutes % minutesCount
    return minutes < 10 ? '0' + minutes : minutes
  }
  // 获取剩余秒数
  const toSeconds = (count: number): any => {
    const num = count % minutesCount
    return num < 10 ? '0' + num : num
    // return count % minutesCount
  }

  const timer: any = useRef()

  const [ day, setDay ] = useState(0)
  const [ hours, setHours ] = useState(0)
  const [ minutes, setMinutes ] = useState(0)
  const [ seconds, setSeconds ] = useState(0)

  const [count, setCount] = useState(0)
  // const [ start, setStart ] = useState(false)

  // endTime
  useEffect(() => {
    if (endTime) {
      let time = 0
      if (isNaN(endTime)) {
        let dayCount = 0
        let nowTimeCount = new Date().getTime()
        let endTimeCount = new Date(endTime.replace(/\-/g, '/')).getTime()
        time = endTimeCount > nowTimeCount ? endTimeCount - nowTimeCount : 0
        dayCount = parseInt((time / dayTimeStamp) + '')
        if (dayCount > 0) {
          time = time - (dayCount * dayTimeStamp)
          setDay(dayCount)
        }
      } else {
        time = endTime
      }
      setCount(Number(toCount(time)))
    }
  }, [endTime])

  // count
  useEffect(() => {
    if (count > 0) {
      setTime()
      timer.current = setTimeout(() => {
        setCount(count => count - 1)
      }, 1000)
    } else {
      setTime()
      if (day > 0) {
        setCount(Number(toCount(dayTimeStamp)))
        
        setTimeout(() => {
          setDay(day => day - 1)
        }, 1000)
      } else {
        clearTimeout(timer.current)
        endTime && setEnd(true)
      }
    }
    return () => {
      clearTimeout(timer.current)
    }
  }, [count])

  const setTime = () => {
    setHours(() => {
      return toHours(count)
    })
    setMinutes(() => {
      return toMinutes(count)
    })
    setSeconds(() => {
      return toSeconds(count)
    })
  }

  return { day, hours, minutes, seconds, setEndTime, end }
}

export default useCountDown