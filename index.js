const walk = require('walk')
const xtend = require('xtend')
const util = require('util')
const { Observable } = require('rxjs/Observable')
const { share } = require('rxjs/operators/share')
const { empty } = require('rxjs/observable/empty')

const debuglog = util.debuglog('walk-observable')

const errorTypes = ['nodeError', 'directoryError', 'errors']

module.exports = (p, opts) => {
  opts = xtend(
    { share: false, types: ['file'], breakOnError: true, autoNext: true },
    opts
  )

  const subscribe = observer => {
    let { types } = opts

    if (typeof types === 'string') types = [types]

    types = types.filter(t => t || (t && t !== 'end'))

    if (types.length === 0) {
      debuglog('No valid types given, Observable will be empty!')
      return empty()
    }

    const walker = walk.walk(p, opts)

    if (opts.breakOnError) {
      errorTypes.forEach(e => walker.on(e, err => observer.error(err)))
      types = types.filter(t => errorTypes.indexOf(t) === -1)
    }

    const onData = t =>
      opts.autoNext
        ? (root, stat, next) => {
            observer.next({ type: t, root, stat })
            next()
          }
        : (root, stat, next) => {
            observer.next({ type: t, root, stat, next })
          }

    types.forEach(t => {
      walker.on(t, onData(t))
    })

    walker.on('end', () => {
      observer.complete()
    })
  }

  return opts.share
    ? Observable.create(subscribe).pipe(share())
    : Observable.create(subscribe)
}
