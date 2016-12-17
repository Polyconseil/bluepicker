export function createElement (classList = [], innerHTML = '', events = {}, tagName = 'div', id = null) {
  const div = document.createElement(tagName)
  if (id) {
    div.id = id
  }
  div.classList = classList
  div.innerHTML = innerHTML
  for (let eventKey of Object.keys(events)) {
    div.addEventListener(eventKey, events[eventKey], false)
  }
  return div
}

export function range (a = null, b = null) {
  if (a == null) {
    return []
  }
  if (b == null) {
    return [...Array(a).keys()]
  }
  if (b < a) {
    throw Error("Can't use range() if a > b")
  }
  return [...Array(b - a).keys()].map((x) => x + a)
}
