mod = angular.module('doubtfire.sessions.states', [
  require('./sign-in/sign-in')
  require('./sign-out/sign-out')
])

module.exports = mod.name
