import moment from 'moment'
import { getTzOffset } from 'src/dateutils.js'
import bluepicker from 'src/index.js'
import styles from 'src/styles.css'

function setUpBluePicker (config, withTzField = false) {
  const tzField = withTzField ? '<span class="timezone"></span>' : ''
  document.body.innerHTML = `<div id="root"><input type="text"></input>${tzField}</div>`
  bluepicker.init('root', config, null)
}

function dispatchEvent (element, eventType) {
  const evt = document.createEvent('Events')
  evt.initEvent(eventType, true, false)
  element.dispatchEvent(evt)
}

function clickInputAndAssertDropdownIsVisible () {
  const inputElt = document.querySelector('#root > input')
  const dropdown = document.querySelector(`.${styles.bluepicker_date_dropdown}`)
  inputElt.click()
  expect(dropdown.style.display).toBe('block')
}


describe('Bluepicker mode days', () => {
  afterEach(function () {
    document.body.removeChild(document.getElementById('root'))
  })
  it('should propagate via callback', (done) => {
    const date = '2012-03-03T22:45:32'
    function callback (detail) {
      expect(detail.value.format('YYYY-MM-DDTHH:mm:ss')).toBe(date)
      delete detail['value']
      expect(detail).toEqual({id: 'root', format: '', utcMode: false})
      done()
    }
    setUpBluePicker({mode: 'days', callback: callback})
    const inputElt = document.querySelector('#root > input')
    inputElt.value = date
    dispatchEvent(inputElt, 'change')
  })
})

describe('Bluepicker mode days', () => {
  beforeEach(function () {
    setUpBluePicker({mode: 'days'})
  })
  afterEach(function () {
    document.body.removeChild(document.getElementById('root'))
  })
  it('should not display the table at init', () => {
    const dropdown = document.querySelector(`.${styles.bluepicker_date_dropdown}`)
    expect(dropdown.style.display).toBe('none')
  })
  it('should propagate via custom event', (done) => {
    const inputElt = document.querySelector('#root > input')
    const date = '2012-03-03T22:45:32'
    const root = document.querySelector('#root')
    let listener = null
    listener = (e) => {
      expect(e.detail).toEqual({value: moment(date), id: 'root', format: '', utcMode: false})
      root.removeEventListener('bluepicker:update', listener)
      done()
    }
    root.addEventListener('bluepicker:update', listener)
    inputElt.value = date
    dispatchEvent(inputElt, 'change')
  })
  it('should allow the selection of a day and its manual reset', (done) => {
    clickInputAndAssertDropdownIsVisible()
    const allDatesElts = Array.from(document.querySelectorAll(`.${styles.dow}`))
    const firstDateElt = allDatesElts.filter((el) => el.textContent === '15')[0]
    firstDateElt.click()
    const inputElt = document.querySelector('#root > input')
    const yearAndMonth = moment().format('YYYY-MM')
    const offset = getTzOffset(moment(`${yearAndMonth}-15`))
    expect(inputElt.value).toEqual(`${yearAndMonth}-15T00:00:00${offset}`)

    // try to reset it and check that the event is sent upstream
    const root = document.querySelector('#root')
    let listener = null
    listener = (e) => {
      expect(e.detail.value).toBe(null)
      root.removeEventListener('bluepicker:update', listener)
      done()
    }
    root.addEventListener('bluepicker:update', listener)
    inputElt.value = ''
    dispatchEvent(inputElt, 'change')
    expect(inputElt.value).toEqual('')
  })
})

describe('Bluepicker mode hours', () => {
  beforeEach(function () {
    setUpBluePicker({mode: 'hours'})
  })
  afterEach(function () {
    document.body.removeChild(document.getElementById('root'))
  })
  it('should not display the table at init', () => {
    const dropdown = document.querySelector(`.${styles.bluepicker_date_dropdown}`)
    expect(dropdown.style.display).toBe('none')
  })
  it('should allow the selection of a day and an hour', () => {
    clickInputAndAssertDropdownIsVisible()
    const allDatesElts = Array.from(document.querySelectorAll(`.${styles.dow}`))
    const firstDateElt = allDatesElts.filter((el) => el.textContent === '15')[0]
    firstDateElt.click()
    const allHoursElts = Array.from(document.querySelectorAll(`.${styles.hod}`))
    expect(allHoursElts.map((el) => el.textContent)).toEqual([
      '00:00', '01:00', '02:00', '03:00', '04:00', '05:00', '06:00', '07:00', '08:00', '09:00', '10:00', '11:00',
      '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00',
    ])
    allHoursElts[2].click()
    const inputElt = document.querySelector('#root > input')
    const yearAndMonth = moment().format('YYYY-MM')
    const offset = getTzOffset(moment(`${yearAndMonth}-15`))
    expect(inputElt.value).toEqual(`${yearAndMonth}-15T02:00:00${offset}`)
  })
})

describe('Bluepicker mode minutes', () => {
  beforeEach(function () {
    setUpBluePicker({mode: 'minutes'})
  })
  afterEach(function () {
    document.body.removeChild(document.getElementById('root'))
  })
  it('should not display the table at init', () => {
    const dropdown = document.querySelector(`.${styles.bluepicker_date_dropdown}`)
    expect(dropdown.style.display).toBe('none')
  })
  it('should allow the selection of a day an hour and minutes', () => {
    clickInputAndAssertDropdownIsVisible()
    const allDatesElts = Array.from(document.querySelectorAll(`.${styles.dow}`))
    const firstDateElt = allDatesElts.filter((el) => el.textContent === '15')[0]
    firstDateElt.click()
    const allHoursElts = Array.from(document.querySelectorAll(`.${styles.hod}`))
    expect(allHoursElts.map((el) => el.textContent)).toEqual([
      '00:00', '01:00', '02:00', '03:00', '04:00', '05:00', '06:00', '07:00', '08:00', '09:00', '10:00', '11:00',
      '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00',
    ]
    )
    allHoursElts[23].click()
    const allMinutesElts = Array.from(document.querySelectorAll(`.${styles.moh}`))
    expect(allMinutesElts.map((el) => el.textContent)).toEqual(['23:00', '23:10', '23:20', '23:30', '23:40', '23:50'])
    allMinutesElts[0].click()
    const inputElt = document.querySelector('#root > input')
    const yearAndMonth = moment().format('YYYY-MM')
    const offset = getTzOffset(moment(`${yearAndMonth}-15`))
    expect(inputElt.value).toEqual(`${yearAndMonth}-15T23:00:00${offset}`)
  })
  it('should not change the hour set manually by the user', () => {
    clickInputAndAssertDropdownIsVisible()
    const inputElt = document.querySelector('#root > input')
    inputElt.value = '2012-03-03T22:45:32+01:00'
    dispatchEvent(inputElt, 'change')

    clickInputAndAssertDropdownIsVisible()
    const allDatesElts = Array.from(document.querySelectorAll(`.${styles.dow}`))
    const firstDateElt = allDatesElts.filter((el) => el.textContent === '15')[0]
    firstDateElt.click()
    document.body.click()
    const dropdown = document.querySelector(`.${styles.bluepicker_date_dropdown}`)
    expect(dropdown.style.display).toBe('none')
    expect(inputElt.value).toEqual('2012-03-15T22:45:00+01:00')
  })
})

describe('Bluepicker with tz field', () => {
  afterEach(function () {
    document.body.removeChild(document.getElementById('root'))
  })
  it('should adapt tz field to the init date', (done) => {
    const initDate = '2012-01-12T00:03Z'
    let listener = null
    listener = (e) => {
      expect(e.detail).toEqual({value: moment(initDate), id: 'root', format: '', utcMode: false})
      const tzField = document.querySelector('#root .timezone')
      expect(tzField.innerHTML).toBe('UTC+01:00')
      root.removeEventListener('bluepicker:update', listener)
      done()
    }
    document.body.innerHTML = '<div id="root"><input type="text"></input><span class="timezone"></span></div>'
    const root = document.querySelector('#root')
    root.addEventListener('bluepicker:update', listener)
    bluepicker.init('root', {mode: 'hour'}, initDate)
  }),
  it('should adapt tz field to the selected date', () => {
    const withTzField = true
    setUpBluePicker({mode: 'hour'}, withTzField)
    clickInputAndAssertDropdownIsVisible()
    const inputElt = document.querySelector('#root > input')
    inputElt.value = '2018-03-12T22:45:32+01:00' // before the clock change in France
    dispatchEvent(inputElt, 'change')

    const tzField = document.querySelector('#root .timezone')
    expect(tzField.innerHTML).toBe('UTC+01:00')

    inputElt.value = '2018-03-28T22:45:32+01:00' // after the clock change in France
    dispatchEvent(inputElt, 'change')
    expect(inputElt.value).toBe('2018-03-28T23:45:32+02:00')
    expect(tzField.innerHTML).toBe('UTC+02:00')
  })
})
