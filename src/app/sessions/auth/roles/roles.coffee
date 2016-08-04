mod = angular.module("doubtfire.sessions.auth.roles", [
  require('./if-role')
])
#
# Authentication roles
#
.constant("authRoles", [
  "anon"
  "Student"
  "Tutor"
  "Convenor"
  "Admin"
])

module.exports = mod.name
