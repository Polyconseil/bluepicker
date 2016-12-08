import moment from 'moment'


import * as dateutils from 'src/dateutils.js'
import * as utils from 'src/utils.js'

import 'src/styles.css'

import tableTemplate from 'src/table.dot'


const DEFAULT_OPTIONS = {
  locale: 'en',
  format: ''
}

const DEFAULT_STYLES = {
}


function enumerateDaysOfCalendar (currentDay, format = 'D') {
  const start = currentDay.clone().startOf('month').startOf('week')
  const end = currentDay.clone().endOf('month').endOf('week')
  const diffInDays = end.diff(start, 'days')
  
  const enumerated = []
  for (let i=0; i<6; i++) {
    enumerated.push(dateutils.daysOfWeek((d) => {
      let style = ''
      if (d.month() !== currentDay.month()) {
        style = 'gray'
      } else if (d.isSame(moment(), 'day')) {
        style = 'today'
      }

      return {
        text: d.format('D'),
        style: style,
      }
    }, start))
    start.add(1, 'week')
  }
  return enumerated
}


function tableForDay (day) {
  return tableTemplate({
    daysOfWeek: dateutils.daysOfWeek(),
    monthYear: day.format('Y-MMM'),
    lines: enumerateDaysOfCalendar(day),
  })
}


export function init (id, {locale, format} = DEFAULT_OPTIONS, styles = DEFAULT_STYLES) {

  moment.locale(locale)

  let currentDay = moment()

  const root = document.getElementById(id)
  const inputField = root.getElementsByTagName('input')[0];
  const parent = utils.createElement(['bluepicker'])
  root.appendChild(parent)
  
  const mainTable = utils.createElement(
    [],
    tableForDay(currentDay),
    {
      click: function (e) {
        const t = e.target
        if (t.classList.contains('left')) {
          currentDay.subtract(1, 'month')
          mainTable.innerHTML = tableForDay(currentDay)
        } else if (t.classList.contains('right')) {
          currentDay.add(1, 'month')
          mainTable.innerHTML = tableForDay(currentDay)
        } else if (t.classList.contains('dow')) {
          inputField.value = moment({
            year: currentDay.year(),
            month: currentDay.month(),
            day: parseInt(t.innerText, 10),
          }).format(format)
        }
        e.stopPropagation()
      }
    }
  )

  parent.appendChild(mainTable)

  root.addEventListener('click', function (e) {
    parent.style.display = 'block'
    e.stopPropagation()
  }, false)

  document.addEventListener('click', function () {
    parent.style.display = 'none'
  })
}

window.bluepicker = {
  init: init,
}
