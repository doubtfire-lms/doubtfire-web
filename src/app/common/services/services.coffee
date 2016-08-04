mod = angular.module("doubtfire.common.services", [
  require('./alert-service')
  require('./grade-service')
  require('./header-service')
  require('./project-service')
  require('./redirect-service')
  require('./task-service')
  require('./unit-service')
  require('./group-service')
  require('./outcome-service')
  require('./analytics-service')
  require('./date-service')
])

module.exports = mod.name
