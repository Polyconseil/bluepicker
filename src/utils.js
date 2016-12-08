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


export function debounce(func, wait) {
  let timeout = null
  return function() {
    const args = arguments
    if (timeout != null) {
      clearTimeout(timeout)
    }
    timeout = setTimeout(() => {
      func(arguments)
    }, wait)
  }
}
