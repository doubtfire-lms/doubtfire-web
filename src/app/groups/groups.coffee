mod = angular.module('doubtfire.groups', [
  require('./group-member-contribution-assigner/group-member-contribution-assigner')
  require('./group-member-list/group-member-list')
  require('./group-selector/group-selector')
  require('./groupset-group-manager/groupset-group-manager')
  require('./groupset-selector/groupset-selector')
  require('./student-group-manager/student-group-manager')
  require('./tutor-group-manager/tutor-group-manager')
])

module.exports = mod.name
