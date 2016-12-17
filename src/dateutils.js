import moment from 'moment'

import {range} from 'src/utils'

export function daysOfWeek (formatFunc = (d) => d.format('ddd'), from = moment()) {
  let startPoint = from.clone().startOf('week').subtract(1, 'day')
  return range(7).map(() => formatFunc(startPoint.add(1, 'day')))
}
