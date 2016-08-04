#
# This sets where the Doubtfire API sits
# It is set in env.config.js
#
environment = require('./env.coffee')

mod = angular.module("doubtfire.api.api-url", [])

.constant("api", environment.API_URL)

module.exports = mod.name
