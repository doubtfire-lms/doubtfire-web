mod = angular.module('doubtfire.units', [
  require('./modals/modals')
  require('./states/states')
  require('./stats/stats')
  require('./unit-analytics-viewer/unit-analytics-viewer')
  require('./unit-details-editor/unit-details-editor')
  require('./unit-groupset-editor/unit-groupset-editor')
  require('./unit-ilo-editor/unit-ilo-editor')
  require('./unit-staff-editor/unit-staff-editor')
  require('./unit-student-list/unit-student-list')
  require('./unit-student-plagiarism-list/unit-student-plagiarism-list')
  require('./unit-student-portfolio-list/unit-student-portfolio-list')
  require('./unit-students-editor/unit-students-editor')
  require('./unit-tasks-editor/unit-tasks-editor')
  require('./unit-tutorials-editor/unit-tutorials-editor')
])

module.exports = mod.name
