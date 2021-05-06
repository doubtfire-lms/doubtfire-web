angular.module("doubtfire.sessions.cookies", [])
#
# Cookies used in doubtfire auth
#
.constant("usernameCookie", "doubtfire_user")
.constant("rememberDoubtfireCredentialsCookie", "remember_doubtfire_credentials_token")
.constant("doubtfireLoginTimeCookie", "doubtfire_login_time")
