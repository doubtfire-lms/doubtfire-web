angular.module("doubtfire.sessions.auth.roles", [
  'doubtfire.sessions.auth.roles.if-role'
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
