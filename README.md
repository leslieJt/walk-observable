# walk-observable

[![NPM](https://nodei.co/npm/walk-observable.png)](https://nodei.co/npm/walk-observable/)

observable version for [walk](https://www.npmjs.com/package/walk) based on
[rxjs](https://www.npmjs.com/package/rxjs).

## Installation

```bash
npm install --save walk-observable
```

## Getting Started

```js
const path = require('path')
const walk = require('./index')
const { filter } = require('rxjs/operators/filter')

walk('./', { filters: ['node_modules'] })
  .pipe(
    filter(v => {
      v.next()
      return v.stat.name.match(/\.json$/)
    })
  )
  .subscribe({
    next: v => {
      console.log(`type: ${v.type} / ${path.join(v.root, v.stat.name)}`)
      v.next()
    },
    error: err => console.error(err),
    complete: () => console.log('done.'),
  })
```

## API

walk(path, [options])

### Options

* `share` - whether Observable that returned is cold or hot, default is `false`
* `types` - listener types, default is only `file`,it can be `names`,
  `directory`, `directories`, `file`, `files`, `end`, `nodeError`,
  `directoryError`, `errors`
* `breakOnError` - whether Observable emit error when encounter any error,
  default is `true`

see [walk](https://www.npmjs.com/package/walk) for more details.
