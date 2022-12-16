#
# The Doubtfire configuration module stores all configuration settings
# for Doubtfire loaded at runtime.
#
# The order in which the modules load here is IMPORTANT so do not rearrange
# them
#
angular.module('doubtfire.config', [
  'doubtfire.config.vendor-dependencies'
  'doubtfire.config.local-storage'
  'doubtfire.config.routing'
  'doubtfire.config.analytics'
  'doubtfire.config.runtime'
  'doubtfire.config.root-controller'
  'doubtfire.config.debug'
])
