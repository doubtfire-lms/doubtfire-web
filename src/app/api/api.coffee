mod = angular.module("doubtfire.api", [
  require('./api-url')
  require('./resource-plus')
  require('./models/models')
])
module.exports = mod.name
