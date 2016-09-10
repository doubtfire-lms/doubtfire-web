mod = angular.module('doubtfire.units.stats', [
  require('./unit-target-grade-stats/unit-target-grade-stats')
  require('./unit-achievement-stats/unit-achievement-stats')
  require('./unit-stats-download/unit-stats-download')
])

module.exports = mod.name
