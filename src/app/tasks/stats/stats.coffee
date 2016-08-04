mod = angular.module('doubtfire.tasks.stats', [
  require('./task-completion-stats/task-completion-stats')
  require('./task-status-stats/task-status-stats')
  require('./task-summary-stats/task-summary-stats')
])

module.exports = mod.name
