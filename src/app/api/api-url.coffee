angular.module("doubtfire.api.api-url", [])

#
# This sets where the Doubtfire API sits. It is set in env.config.js.
# Where null is provided for the API_URL, we use window.location to determine
# this instead.
#
.constant("api", (->
  envUrl = '/* @echo API_URL */'
  if envUrl == 'undefined' then "https://#{window.location.host}/api" else envUrl
)())
