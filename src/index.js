import moment from 'moment'


import * as dateutils from 'src/dateutils.js'
import * as utils from 'src/utils.js'

import styles from 'src/styles.css'

import dayHeaderTemplate from 'src/table-header-day.dot'
import hourHeaderTemplate from 'src/table-header-hour.dot'
import minuteHeaderTemplate from 'src/table-header-minute.dot'

import tableTemplate from 'src/table.dot'

const MODE_DAYS = 'days'
const MODE_HOURS = 'hours'
const MODE_MINUTES = 'minutes'

function enumerateDaysOfCalendar (currentDay, format = 'D') {
  const start = currentDay.clone().startOf('month').startOf('week')

  const enumerated = []
  for (let i = 0; i < 6; i++) {
    enumerated.push(dateutils.daysOfWeek((d) => {
      let style = styles.dow + ' '
      if (d.month() !== currentDay.month()) {
        style += styles.gray
      } else if (d.isSame(moment(), 'day')) {
        style += styles.today
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
    styles: styles,
    thead: dayHeaderTemplate({
      daysOfWeek: dateutils.daysOfWeek(),
      monthYear: day.format('Y-MMM'),
      styles: styles,
    }),
    lines: enumerateDaysOfCalendar(day),
  })
}


function tableForHours (day) {
  const enumerated = []
  for (let i = 0; i < 6; i++) {
    enumerated.push(utils.range(4).map((j) => {
      const text = (i * 4) + j + 1
      let style = styles.hod + ' '
      if (moment().hour() === text) {
        style += styles.today
      }
      return {
        text: text,
        style: style,
      }
    }))
  }
  return tableTemplate({
    styles: styles,
    thead: hourHeaderTemplate({
      currentDay: day.format('LL'),
      styles: styles,
    }),
    lines: enumerated,
  })
}


function tableForMinutes (dayWithHour) {
  const enumerated = []
  for (let i = 0; i < 3; i++) {
    enumerated.push(utils.range(4).map((j) => {
      const text = ((i * 4) + j) * 5
      let style = styles.moh + ' '
      const currentMinute = moment().minute()
      if (currentMinute - (currentMinute % 5) === text) {
        style += styles.today
      }
      return {
        text: text,
        style: style,
      }
    }))
  }
  return tableTemplate({
    styles: styles,
    thead: minuteHeaderTemplate({
      currentTime: dayWithHour.format('lll'),
      styles: styles,
    }),
    lines: enumerated,
  })
}


export function init (
  id,
  {
    callback = null,
    format = '',
    locale = 'en',
    mode = MODE_MINUTES,
  } = {},
  initValue = null) {

  moment.locale(locale)

  let currentDay = moment()

  const root = document.getElementById(id)
  const inputField = root.getElementsByTagName('input')[0]
  const parent = utils.createElement([styles.bluepicker, 'bluepicker__public'])
  root.appendChild(parent)

  let selectedDay = null
  if (initValue) {
    // FIXME: strip it to minutes or something of the sort
    selectedDay = initValue
    inputField.value = selectedDay.format(format)
  } else {
    selectedDay = moment({
      year: currentDay.year(),
      month: currentDay.month(),
    })
  }

  function updateValue () {
    const data = {
      id: id,
      format: format,
      value: selectedDay,
    }
    if (callback) {
      callback(data)
    }
    const event = new CustomEvent('bluepicker:update', data)
    root.dispatchEvent(event)
    inputField.value = selectedDay.format(format)
  }

  function hideAndResetTable () {
    mainTable.innerHTML = tableForDay(currentDay)
    parent.style.display = 'none'
  }

  const mainTable = utils.createElement(
    [],
    '',
    {
      click: function (e) {
        let t = e.target
        if (t.classList.contains(styles.left)) {
          currentDay.subtract(1, 'month')
          mainTable.innerHTML = tableForDay(currentDay)
        } else if (t.classList.contains(styles.right)) {
          currentDay.add(1, 'month')
          mainTable.innerHTML = tableForDay(currentDay)
        } else if (t.classList.contains(styles.dow)) {
          selectedDay.date(parseInt(t.innerText, 10))
          if (mode === MODE_DAYS) {
            updateValue()
            hideAndResetTable()
          } else if (mode === MODE_HOURS || mode === MODE_MINUTES) {
            mainTable.innerHTML = tableForHours(selectedDay)
          } else {
            console.warn('Should never get there !')
          }
        } else if (t.classList.contains(styles.hod)) {
          selectedDay.hour(parseInt(t.innerText, 10))
          if (mode === MODE_HOURS) {
            updateValue()
            hideAndResetTable()
          } else if (mode === MODE_MINUTES) {
            mainTable.innerHTML = tableForMinutes(selectedDay)
          } else {
            console.warn('Should never get there !')
          }
        } else if (t.classList.contains(styles.moh)) {
          selectedDay.minute(parseInt(t.innerText, 10))
          if (mode === MODE_MINUTES) {
            updateValue()
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
  hideAndResetTable()

  root.addEventListener('click', function (e) {
    for (let item of document.getElementsByClassName('bluepicker__public')) {
      item.style.display = 'none'
    }
    parent.style.display = 'block'
    e.stopPropagation()
  }, false)

  document.addEventListener('click', hideAndResetTable, {passive: true})
}

export const bluepicker = {
  init: init,
}
module.exports = bluepicker
window.bluepicker = bluepicker
