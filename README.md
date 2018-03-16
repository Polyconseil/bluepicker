# Bluepicker

<img src="https://travis-ci.org/Polyconseil/bluepicker.svg?branch=master">

A beautiful VanillaJS date or datetime picker that also supports local or UTC input.


## Why ?

It is nearly impossible to find a date(time) picker that simultaneously brings:

- Only has the awesome [momentjs](https://momenjs.com) as dependency
- Local CSS styles (avoids conflicts with the surrounding application)
- Can be either an efficient *Date* picker or a *Datetime* one
- Supports UTC or local time input
- Low complexity: less than 500 SLOC.
- Is beautiful and easy to use enough (not 5 dropdowns)

## Sample code

Simply require it and use it !

```html
<div id="picker_id">
  <input type="text"></input>
</div>
```


```javascript
import bluepicker from 'bluepicker'

import 'bluepicker/dist/bundle.css'  # hashed CSS classes for the picker

bluepicker.init('picker_id')
```


## Configuration

Almost everything is configurable.

```javascript
bluepicker.init('picker_id', {
  callback: null,   // callback upon changes
  locale: 'cn',     // momentJS locale
  format: 'lll',    // momentJS display format
  mode: 'hours',    // asks the day, then the hour, that's it.
  utcMode: true,    // displayed and sent values will be UTC
  padToBoundary: false,  // pad text to minutes, hours or day boundary depending on the mode.
  nowButtonText: 'Now'   // gives you the possibility to customize the "Now" button text.
}, initValue)

```

## Events

Upon changes (either by direct modification in the input field, or a click
in the picker buttons) a DOM event is fired and the callback is called,
if provided.

```javascript
bluepicker.init('picker_id', {callback: onPickerChange})

// or

document.addEventListener('bluepicker:update', onPickerChange)

// fires

function onPickerChange ({id, format, value, utcMode}) {
  // id is the source's datepicker ID
  // format is the display format of the value
  // value is the momentJS instance of the moment that just changed
  // utcMode keeps track if the picker is currently in UTC mode or not.
}
```

## License

MIT
