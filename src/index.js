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
  for (let i = 0; i < 2; i++) {
    enumerated.push(utils.range(3).map((j) => {
      const value = ((i * 3) + j) * 10
      const text = dateutils.formatHour(dayWithHour.hour(), value)
      let style = styles.moh + ' '
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
    /* eslint-disable no-multi-spaces */
    callback = null,        // function to call whenever an update happens.
    format = '',            // format of output. Blank means ISO format.
    locale = 'en',
    mode = MODE_MINUTES,    // switches from a DAY picker, to a HOUR picker and even a MINUTE one.
    utcMode = false,        // when true, the output value is in UTC.
    padToBoundary = true,   // pad output value to the day, hour or minute clicked.
    nowButtonText = 'Now',  // the calling app is responsible for translating this.
    updateOnClose = true,   // also fire an update event when the user closes the picker box.
    /* eslint-enable no-multi-spaces */
  } = {},
  initValue = null) {

  moment.locale(locale)

  let isDisplayed = false

  const root = document.getElementById(id)

  const inputField = root.getElementsByTagName('input')[0]

  const dateDropdown = appendDropdownTo(root, [
    styles.bluepicker_date_dropdown,
    'bluepicker__public', // public CSS class allows for multi-instance dropdown cleaning
  ])

  let selectedDay = {
    // The component needs to have a not null value to work.
    // However we need to know whether the internal value was
    // intentionnaly set by the user or not.
    value: null,
    setByUser: false,
  }

  function initDay () {
    const today = moment()
    return moment({
      year: today.year(),
      month: today.month(),
      date: 1,
      hours: 0,
      minutes: 0,
      seconds: 0,
      milliseconds: 0,
    })
  }

  if (initValue) {
    selectedDay.value = moment(initValue)
    selectedDay.setByUser = true
    inputField.value = selectedDay.value.format(format)
  } else {
    selectedDay.value = initDay()
    selectedDay.setByUser = false
  }

  const tzField = root.getElementsByClassName('timezone')[0]
  if (tzField) {
    switchTzField(utcMode)
    tzField.style.cursor = 'pointer'
    tzField.addEventListener('click', () => switchTzField())
  }


  function dispatchUpdateEvent () {
    const data = {
      id: id,
      format: format,
      value: selectedDay.setByUser ? selectedDay.value : null,
      utcMode: utcMode,
    }
    if (callback) {
      callback(data)
    }
    const event = new CustomEvent('bluepicker:update', {detail: data})
    root.dispatchEvent(event)
  }

  function switchTzField (forceUtc, doUpdate = true) {
    const isForced = typeof forceUtc !== 'undefined'
    if ((isForced && forceUtc === true) || (!isForced && tzField.innerHTML !== 'UTC')) {
      utcMode = true
    } else {
      utcMode = false
    }
    inputField.value = nextInputValue() // put the inputField value in the correct TZ
    updateTzFieldHTML(utcMode)
    if (doUpdate) dispatchUpdateEvent()
  }

  function updateTzFieldHTML (utcMode) {
    const offset = utcMode ? '' : dateutils.getTzOffset(selectedDay.value)
    tzField.innerHTML = `UTC${offset}`
  }

  function padSelectedDay () {
    if (padToBoundary) {
      if (mode === MODE_DAYS) selectedDay.value.set({hours: 0, minutes: 0})
      if (mode === MODE_HOURS) selectedDay.value.set({minutes: 0})
      selectedDay.value.set({seconds: 0, milliseconds: 0})
    }
  }

  function nextInputValue () {
    if (!selectedDay.setByUser) return ''
    if (utcMode) {
      return selectedDay.value.utc().format(format)
    } else {
      return selectedDay.value.local().format(format)
    }
  }

  function updateValue () {
    dispatchUpdateEvent()
    inputField.value = nextInputValue()
    if (tzField && !utcMode) {
      // update the offset based on the selected date
      updateTzFieldHTML(utcMode)
    }
  }

  function hideAndResetTable () {
    mainTable.innerHTML = tableForDay(selectedDay.value, nowButtonText)
    dateDropdown.style.display = 'none'
    isDisplayed = false
  }

  function updateAfterClick ({pad = true} = {}) {
    if (pad) {
      padSelectedDay()
    } else {
      selectedDay.value.set({seconds: 0, milliseconds: 0})
    }
    selectedDay.setByUser = true
    updateValue()
    hideAndResetTable()
  }

  const mainTable = utils.createElement(
    [],
    '',
    {
      click: function (e) {
        let t = e.target
        if (t.classList.contains(styles.left)) {
          selectedDay.value.subtract(1, 'month')
          mainTable.innerHTML = tableForDay(selectedDay.value, nowButtonText)
        } else if (t.classList.contains(styles.right)) {
          selectedDay.value.add(1, 'month')
          mainTable.innerHTML = tableForDay(selectedDay.value, nowButtonText)
        } else if (t.classList.contains(styles.dow)) {
          const clickedDay = moment(utils.getDataValue(t))
          selectedDay.value.set({
            'year': clickedDay.year(),
            'month': clickedDay.month(),
            'date': clickedDay.date(),
          })
          if (mode === MODE_DAYS) {
            updateAfterClick()
          } else if (mode === MODE_HOURS || mode === MODE_MINUTES) {
            mainTable.innerHTML = tableForHours(selectedDay.value)
          } else {
            console.warn('Should never get there !')
          }
        } else if (t.classList.contains(styles.hod)) {
          selectedDay.value.hour(utils.getIntDataValue(t))
          if (mode === MODE_HOURS) {
            updateAfterClick()
          } else if (mode === MODE_MINUTES) {
            mainTable.innerHTML = tableForMinutes(selectedDay.value)
          } else {
            console.warn('Should never get there !')
          }
        } else if (t.classList.contains(styles.moh)) {
          selectedDay.value.minute(utils.getIntDataValue(t))
          if (mode === MODE_MINUTES) {
            updateAfterClick()
          } else {
            console.warn('Should never get there !')
          }
        } else if (t.classList.contains(styles.nowButton)) {
          const now = moment()
          selectedDay.value.set({
            'year': now.year(),
            'month': now.month(),
            'date': now.date(),
            'hour': now.hour(),
            'minute': now.minute(),
            'second': now.second(),
          })
          updateAfterClick({pad: false})
        }
        e.stopPropagation()
      },
    }
  )

  dateDropdown.appendChild(mainTable)
  hideAndResetTable()

  let valueBeforeFocus = null
  inputField.addEventListener('focus', function (e) {
    valueBeforeFocus = inputField.value
  })

  inputField.addEventListener('change', function (e) {
    let newDay = null
    if (utcMode) {
      newDay = moment.utc(inputField.value)
    } else {
      newDay = moment(inputField.value)
    }
    if (newDay.isValid()) {
      selectedDay.value = newDay
      selectedDay.setByUser = true
    } else {
      selectedDay.value = initDay()
      selectedDay.setByUser = false
    }
    updateValue()
    hideAndResetTable()
  })

  inputField.addEventListener('click', function (e) {
    hideBluepickerElements()
    dateDropdown.style.display = 'block'
    isDisplayed = true
    e.stopPropagation()
  }, false)

  document.addEventListener('click', (e) => {
    if (isDisplayed) {
      hideBluepickerElements()
      if (nextInputValue() !== inputField.value && updateOnClose) {
        updateAfterClick({'pad': false})
      } else if (valueBeforeFocus !== inputField.value && updateOnClose) {
        updateAfterClick()
      } else {
        hideAndResetTable()
      }
    }
  })

  return {
    update: function (value, forceUtc) {
      selectedDay.value = moment(value)
      selectedDay.setByUser = true
      inputField.value = selectedDay.value.format(format)
      switchTzField(forceUtc, false)
    },
  }
}

const bluepicker = {
  init: init,
}
export default bluepicker
window.bluepicker = bluepicker
