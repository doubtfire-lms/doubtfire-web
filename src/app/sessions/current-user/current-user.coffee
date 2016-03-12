angular.module("doubtfire.sessions.current-user", [])
#
# Current user singleton
#
.constant("currentUser",
  id: 0
  role: "anon"
  profile:
    name: "Anonymous"
    nickname: "anon"
)
