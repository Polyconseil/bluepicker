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

function hideBluepickerElements () {
  for (let item of document.getElementsByClassName('bluepicker__public')) {
    item.style.display = 'none'
  }
}

function appendDropdownTo (item, classes) {
  const drop = utils.createElement(classes)
  item.appendChild(drop)
  return drop
}

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
        value: d.format('YYYY-MM-DD'),
      }
    }, start))

    start.add(1, 'week')
  }
  return enumerated
}


function tableForDay (day, nowButtonText) {
  return tableTemplate({
    styles: styles,
    thead: dayHeaderTemplate({
      daysOfWeek: dateutils.daysOfWeek(),
      monthYear: day.format('Y-MMM'),
      styles: styles,
    }),
    lines: enumerateDaysOfCalendar(day),
    nowButtonText: nowButtonText,
  })
}


function tableForHours (day) {
  const enumerated = []
  for (let i = 0; i < 6; i++) {
    enumerated.push(utils.range(4).map((j) => {
      const value = (i * 4) + j
      const text = dateutils.formatHour(value)
      let style = styles.hod + ' '
      if (moment().hour() === value) {
        style += styles.today
      }
      return {
        text: text,
        style: style,
        value: value,
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
      const value = ((i * 4) + j) * 5
      const text = dateutils.formatHour(dayWithHour.hour(), value)
      let style = styles.moh + ' '
      const currentMinute = moment().minute()
      if (currentMinute - (currentMinute % 5) === value) {
        style += styles.today
      }
      return {
        text: text,
        style: style,
        value: value,
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


// FIXME: For now the choice is to leave the user free to create the input/TZ fields. We could also create them if not provided.
export function init (
  id,
  {
    callback = null,
    format = '',
    locale = 'en',
    mode = MODE_MINUTES,
    utcMode = false,
    nowButtonText = 'Now',  // the calling app is responsible for translating this.
  } = {},
  initValue = null) {

  moment.locale(locale)

  const root = document.getElementById(id)

  const inputField = root.getElementsByTagName('input')[0]

  const dateDropdown = appendDropdownTo(root, [
    styles.bluepicker_date_dropdown,
    'bluepicker__public',  // public CSS class allows for multi-instance dropdown cleaning
  ])

  const tzField = root.getElementsByClassName('timezone')[0]
  if (tzField) {
    switchTzField(null, utcMode)
    tzField.style.cursor = 'pointer'
    tzField.addEventListener('click', switchTzField)
  }

  let selectedDay = null
  if (initValue) {
    selectedDay = moment(initValue)
    inputField.value = selectedDay.format(format)
  } else {
    const today = moment()
    selectedDay = moment({
      year: today.year(),
      month: today.month(),
      date: 1,
      hours: 0,
      minutes: 0,
      seconds: 0,
      milliseconds: 0,
    })
  }

  function dispatchUpdateEvent () {
    if (!selectedDay) return  // do not bother if no value yet
    const data = {
      id: id,
      format: format,
      value: selectedDay,
      utcMode: utcMode,
    }
    if (callback) {
      callback(data)
    }
    const event = new CustomEvent('bluepicker:update', data)
    root.dispatchEvent(event)
  }

  function switchTzField (event, forceUtc) {
    const isForced = typeof forceUtc !== 'undefined'
    if ((isForced && forceUtc === true) || (!isForced && tzField.innerHTML !== 'UTC')) {
      tzField.innerHTML = 'UTC'
      utcMode = true
    } else {
      tzField.innerHTML = dateutils.getTzOffset()
      utcMode = false
    }
    dispatchUpdateEvent()
  }

  function updateValue () {
    dispatchUpdateEvent()
    if (utcMode) {
      inputField.value = selectedDay.format(format)
    } else {
      inputField.value = selectedDay.local().format(format)
    }
  }

  function hideAndResetTable () {
    mainTable.innerHTML = tableForDay(selectedDay, nowButtonText)
    dateDropdown.style.display = 'none'
  }

  const mainTable = utils.createElement(
    [],
    '',
    {
      click: function (e) {
        let t = e.target
        if (t.classList.contains(styles.left)) {
          selectedDay.subtract(1, 'month')
          mainTable.innerHTML = tableForDay(selectedDay, nowButtonText)
        } else if (t.classList.contains(styles.right)) {
          selectedDay.add(1, 'month')
          mainTable.innerHTML = tableForDay(selectedDay, nowButtonText)
        } else if (t.classList.contains(styles.dow)) {
          const clickedDay = moment(utils.getDataValue(t))
          selectedDay.set({
            'year': clickedDay.year(),
            'month': clickedDay.month(),
            'date': clickedDay.date(),
          })
          if (mode === MODE_DAYS) {
            updateValue()
            hideAndResetTable()
          } else if (mode === MODE_HOURS || mode === MODE_MINUTES) {
            mainTable.innerHTML = tableForHours(selectedDay)
          } else {
            console.warn('Should never get there !')
          }
        } else if (t.classList.contains(styles.hod)) {
          selectedDay.hour(utils.getIntDataValue(t))
          if (mode === MODE_HOURS) {
            updateValue()
            hideAndResetTable()
          } else if (mode === MODE_MINUTES) {
            mainTable.innerHTML = tableForMinutes(selectedDay)
          } else {
            console.warn('Should never get there !')
          }
        } else if (t.classList.contains(styles.moh)) {
          selectedDay.minute(utils.getIntDataValue(t))
          if (mode === MODE_MINUTES) {
            updateValue()
            hideAndResetTable()
          } else {
            console.warn('Should never get there !')
          }
        } else if (t.classList.contains(styles.nowButton)) {
          const now = moment()
          selectedDay.set({
            'year': now.year(),
            'month': now.month(),
            'date': now.date(),
            'hour': now.hour(),
            'minute': now.minute(),
            'second': now.second(),
          })
          updateValue()
          hideAndResetTable()
        }
        e.stopPropagation()
      },
    }
  )

  dateDropdown.appendChild(mainTable)
  hideAndResetTable()

  inputField.addEventListener('change', function (e) {
    let newDay = null
    if (utcMode) {
      newDay = moment.utc(inputField.value)
    } else {
      newDay = moment(inputField.value)
    }
    if (newDay.isValid()) {
      selectedDay = newDay
      updateValue()
      hideAndResetTable()
    }
  })

  inputField.addEventListener('click', function (e) {
    hideBluepickerElements()
    dateDropdown.style.display = 'block'
    e.stopPropagation()
  }, false)

  document.addEventListener('click', () => {
    hideBluepickerElements()
    hideAndResetTable()
  })
}

const bluepicker = {
  init: init,
}
export default bluepicker
window.bluepicker = bluepicker
