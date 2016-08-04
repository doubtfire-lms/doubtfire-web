mod = angular.module('doubtfire.tasks.task-ilo-alignment', [
  require('./modals/modals')
  require('./task-ilo-alignment-editor/task-ilo-alignment-editor')
  require('./task-ilo-alignment-rater/task-ilo-alignment-rater')
  require('./task-ilo-alignment-viewer/task-ilo-alignment-viewer')
])

module.exports = mod.name
