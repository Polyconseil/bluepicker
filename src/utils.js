export function createElement (classList = [], innerHTML = '', events = {}, tagName = 'div', id = null) {
  const div = document.createElement(tagName)
  if (id) {
    div.id = id
  }
  for (let klass of classList) {
    div.classList.add(klass)
  }
  div.innerHTML = innerHTML
  for (let eventKey of Object.keys(events)) {
    div.addEventListener(eventKey, events[eventKey], false)
  }
  return div
}

export function getDataValue (domItem) {
  return domItem.getAttribute('data-value')
}

export function getIntDataValue (domItem) {
  return parseInt(getDataValue(domItem), 10)
}

export function range (a = null, b = 0) {
  if (a == null) {
    return []
  }
  return [...Array.from(Array(Math.abs(b - a)).keys())].map((x) => x + Math.min(a, b))
}

export function padStart (str, maxLength, fillString = ' ') {
  if (str.length >= maxLength) {
    return str
  }

  fillString = String(fillString)
  if (fillString.length === 0) {
    fillString = ' '
  }

  let fillLen = maxLength - str.length
  let timesToRepeat = Math.ceil(fillLen / fillString.length)
  let truncatedStringFiller = fillString
    .repeat(timesToRepeat)
    .slice(0, fillLen)
  return truncatedStringFiller + str
};
