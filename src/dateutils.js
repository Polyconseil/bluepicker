import moment from 'moment'

export function daysOfWeek (formatFunc = (d) => d.format('ddd'), from = moment()) {
  let startPoint = from.clone().startOf('week').subtract(1, 'day')
  return [...Array(7).keys()].map(() => formatFunc(startPoint.add(1, 'day')))
}
