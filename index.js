const walk = require('walk')
const xtend = require('xtend')
const { Observable } = require('rxjs/Observable')
const { share } = require('rxjs/operators/share')

const errorTypes = ['nodeError', 'directoryError', 'errors']

exports = module.exports = (p, opts) => {
  opts = xtend({ share: false, types: ['file'], breakOnError: true }, opts)

  const subscribe = observer => {
    const walker = walk.walk(p, opts)
    let { types } = opts

    if (typeof types === 'string') types = [types]

    types = types.filter(t => t !== 'end')

    if (opts.breakOnError) {
      errorTypes.forEach(e => walker.on(e, err => observer.error(err)))
      types = types.filter(t => errorTypes.indexOf(t) === -1)
    }

    types.forEach(t => {
      walker.on(t, (root, stat, next) => {
        observer.next({ type: t, root, stat, next })
      })
    })

    walker.on('end', () => {
      observer.complete()
    })
  }

  return opts.share
    ? Observable.create(subscribe).pipe(share())
    : Observable.create(subscribe)
}
