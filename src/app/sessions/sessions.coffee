mod = angular.module('doubtfire.sessions', [
  require('./auth/auth')
  require('./cookies/cookies')
  require('./current-user/current-user')
  require('./states/states')
])
module.exports = mod.name
