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
