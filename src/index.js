import moment from 'moment'


import * as dateutils from 'src/dateutils.js'
import * as utils from 'src/utils.js'

import 'src/styles.css'

import dayHeaderTemplate from 'src/table-header-day.dot'
import hourHeaderTemplate from 'src/table-header-hour.dot'
import minuteHeaderTemplate from 'src/table-header-minute.dot'

import tableTemplate from 'src/table.dot'

const MODE_DAYS = 'days'
const MODE_HOURS = 'hours'
const MODE_MINUTES = 'minutes'

const DEFAULT_STYLES = {
}


function enumerateDaysOfCalendar (currentDay, format = 'D') {
  const start = currentDay.clone().startOf('month').startOf('week')

  const enumerated = []
  for (let i = 0; i < 6; i++) {
    enumerated.push(dateutils.daysOfWeek((d) => {
      let style = 'dow '  // day of week
      if (d.month() !== currentDay.month()) {
        style += 'gray'
      } else if (d.isSame(moment(), 'day')) {
        style += 'today'
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
    thead: dayHeaderTemplate({
      daysOfWeek: dateutils.daysOfWeek(),
      monthYear: day.format('Y-MMM'),
    }),
    lines: enumerateDaysOfCalendar(day),
  })
}


function tableForHours (day) {
  const enumerated = []
  for (let i = 0; i < 6; i++) {
    enumerated.push([...Array(4).keys()].map((j) => {
      const text = (i * 4) + j + 1
      let style = 'hod ' // hour of day
      if (moment().hour() === text) {
        style += 'today'
      }
      return {
        text: text,
        style: style,
      }
    }))
  }
  return tableTemplate({
    thead: hourHeaderTemplate({currentDay: day.format('LL')}),
    lines: enumerated,
  })
}


function tableForMinutes (dayWithHour) {
  const enumerated = []
  for (let i = 0; i < 3; i++) {
    enumerated.push([...Array(4).keys()].map((j) => {
      const text = ((i * 4) + j) * 5
      let style = 'moh '  // minute of hour
      const currentMinute = moment().minute()
      if (currentMinute - (currentMinute % 5) === text) {
        style += 'today'
      }
      return {
        text: text,
        style: style,
      }
    }))
  }
  return tableTemplate({
    thead: minuteHeaderTemplate({currentTime: dayWithHour.format('lll')}),
    lines: enumerated,
  })
}


export function init (
  id,
  {
    locale = 'en',
    format = '',
    mode = MODE_MINUTES,
  } = {},
  styles = DEFAULT_STYLES) {

  moment.locale(locale)

  let currentDay = moment()

  const root = document.getElementById(id)
  const inputField = root.getElementsByTagName('input')[0]
  const parent = utils.createElement(['bluepicker'])
  root.appendChild(parent)

  const selectedDay = moment({
    year: currentDay.year(),
    month: currentDay.month(),
  })

  function hideAndResetTable () {
    mainTable.innerHTML = tableForDay(currentDay)
    parent.style.display = 'none'
  }

  const mainTable = utils.createElement(
    [],
    tableForDay(currentDay),
    {
      click: function (e) {
        let t = e.target
        if (t.classList.contains('left')) {
          currentDay.subtract(1, 'month')
          mainTable.innerHTML = tableForDay(currentDay)
        } else if (t.classList.contains('right')) {
          currentDay.add(1, 'month')
          mainTable.innerHTML = tableForDay(currentDay)
        } else if (t.classList.contains('dow')) {
          selectedDay.date(parseInt(t.innerText, 10))
          if (mode === MODE_DAYS) {
            inputField.value = selectedDay.format(format)
            hideAndResetTable()
          } else if (mode === MODE_HOURS || mode === MODE_MINUTES) {
            mainTable.innerHTML = tableForHours(selectedDay)
          } else {
            console.warn('Should never get there !')
          }
        } else if (t.classList.contains('hod')) {
          selectedDay.hour(parseInt(t.innerText, 10))
          if (mode === MODE_HOURS) {
            inputField.value = selectedDay.format(format)
            hideAndResetTable()
          } else if (mode === MODE_MINUTES) {
            mainTable.innerHTML = tableForMinutes(selectedDay)
          } else {
            console.warn('Should never get there !')
          }
        } else if (t.classList.contains('moh')) {
          selectedDay.minute(parseInt(t.innerText, 10))
          if (mode === MODE_MINUTES) {
            inputField.value = selectedDay.format(format)
            hideAndResetTable()
          } else {
            console.warn('Should never get there !')
          }
        }
        e.stopPropagation()
      },
    }
  )

  parent.appendChild(mainTable)

  root.addEventListener('click', function (e) {
    parent.style.display = 'block'
    e.stopPropagation()
  }, false)

  document.addEventListener('click', hideAndResetTable)
}

window.bluepicker = {
  init: init,
}
