import moment from 'moment'

import {range, padStart} from 'src/utils'

export function daysOfWeek (formatFunc = (d) => d.format('ddd'), from = moment()) {
  let startPoint = from.clone().startOf('week').subtract(1, 'day')
  return range(7).map(() => formatFunc(startPoint.add(1, 'day')))
}

export function formatHour (hour, minutes = 0) {
  return padStart(`${hour}`, 2, '0') + ':' + padStart(`${minutes}`, 2, '0')
}

export function getTzOffset () {
  const offset = new Date().getTimezoneOffset()
  const sign = offset <= 0 ? '+' : '-'
  const hours = Math.ceil(Math.abs(offset) / 60)
  const minutes = Math.abs(offset) % 60
  return `UTC${sign}${formatHour(hours, minutes)}`
}
