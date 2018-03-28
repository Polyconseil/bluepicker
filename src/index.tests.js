import moment from 'moment'
import { getTzOffset } from 'src/dateutils.js'
import bluepicker from 'src/index.js'
import styles from 'src/styles.css'


function setUpBluePicker (config) {
  document.body.innerHTML = '<div id="root"><input type="text"></input></div>'
  bluepicker.init('root', config)
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
  beforeEach(function () {
    setUpBluePicker({mode: 'days'})
  })
  afterEach(function () {
    document.body.removeChild(document.getElementById('root'))
  })
  it('It should not display the table at init', () => {
    const dropdown = document.querySelector(`.${styles.bluepicker_date_dropdown}`)
    expect(dropdown.style.display).toBe('none')
  })
  it('It should allow the selection of a day', () => {
    clickInputAndAssertDropdownIsVisible()
    const allDatesElts = Array.from(document.querySelectorAll(`.${styles.dow}`))
    const firstDateElt = allDatesElts.filter((el) => el.textContent === '15')[0]
    firstDateElt.click()
    const inputElt = document.querySelector('#root > input')
    const yearAndMonth = moment().format('YYYY-MM')
    const offset = getTzOffset()
    expect(inputElt.value).toEqual(`${yearAndMonth}-15T00:00:00${offset}`)
  })
})

describe('Bluepicker mode hours', () => {
  beforeEach(function () {
    setUpBluePicker({mode: 'hours'})
  })
  afterEach(function () {
    document.body.removeChild(document.getElementById('root'))
  })
  it('It should not display the table at init', () => {
    const dropdown = document.querySelector(`.${styles.bluepicker_date_dropdown}`)
    expect(dropdown.style.display).toBe('none')
  })
  it('It should allow the selection of a day and an hour', () => {
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
    const offset = getTzOffset()
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
  it('It should not display the table at init', () => {
    const dropdown = document.querySelector(`.${styles.bluepicker_date_dropdown}`)
    expect(dropdown.style.display).toBe('none')
  })
  it('It should allow the selection of a day an hour and minutes', () => {
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
    const offset = getTzOffset()
    expect(inputElt.value).toEqual(`${yearAndMonth}-15T23:00:00${offset}`)
  })
  it('It should not change the hour set manually by the user', () => {
    clickInputAndAssertDropdownIsVisible()
    const offset = getTzOffset()
    const inputElt = document.querySelector('#root > input')
    inputElt.value = `2012-03-03T22:45:32${offset}`
    dispatchEvent(inputElt, 'change')

    clickInputAndAssertDropdownIsVisible()
    const allDatesElts = Array.from(document.querySelectorAll(`.${styles.dow}`))
    const firstDateElt = allDatesElts.filter((el) => el.textContent === '15')[0]
    firstDateElt.click()
    document.body.click()
    const dropdown = document.querySelector(`.${styles.bluepicker_date_dropdown}`)
    expect(dropdown.style.display).toBe('none')
    expect(inputElt.value).toEqual(`2012-03-15T22:45:00${offset}`)
  })
})
