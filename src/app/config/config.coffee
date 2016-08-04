#
# The Doubtfire configuration module stores all configuration settings
# for Doubtfire loaded at runtime.
#
# The order in which the modules load here is IMPORTANT so do not rearrange
# them
#
mod = angular.module('doubtfire.config', [
  require('./vendor-dependencies/vendor-dependencies')
  require('./contributors/contributors')
  require('./local-storage/local-storage')
  require('./routing/routing')
  require('./analytics/analytics')
  require('./runtime/runtime')
  require('./root-controller/root-controller')
  require('./debug/debug')
])
module.exports = mod.name
