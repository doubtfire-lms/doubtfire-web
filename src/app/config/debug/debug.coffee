angular.module('doubtfire.config.debug', [])

#
# You can define any debug helpers here
#

# Debug helper method
scope = ($0) ->
  throw new Error "Select a DOM element using 'Inspect Element' first, then call using scope($0)" unless $0?
  angular.element($0).scope()
