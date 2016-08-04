mod = angular.module('doubtfire.units.modals', [
  require('./unit-create-modal/unit-create-modal')
  require('./unit-ilo-edit-modal/unit-ilo-edit-modal')
  require('./unit-student-enrolment-modal/unit-student-enrolment-modal')
  require('./unit-tutorial-edit-modal/unit-tutorial-edit-modal')
  require('./unit-mark-submissions-offline-modal/unit-mark-submissions-offline-modal')
])

module.exports = mod.name
