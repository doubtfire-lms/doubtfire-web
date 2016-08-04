mod = angular.module("doubtfire.errors.states", [
  require('./not-found/not-found')
  require('./timeout/timeout')
  require('./unauthorised/unauthorised')
])

module.exports = mod.name
