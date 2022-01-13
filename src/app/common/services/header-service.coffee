angular.module("doubtfire.common.services.header", [])

#
# Provider/Service for handling the header
#
.provider('headerService', ($stateProvider) ->
  headerServiceProvider = {}

  #
  # Return the headerService
  #
  headerServiceProvider.$get = ($rootScope) ->
    # Internal object that stores the menus

    headerService = {}

    headerService

  #
  # A provider that instantiates a new state with a header
  # Requires that stateData has at least one view
  #
  headerServiceProvider.state = (stateName, stateData, controller = 'BasicHeaderCtrl') ->
    throw new Error "stateData must have at least one view or have a parent" unless stateData.views? || stateData.parent?
    stateData.views.header =
      controller: controller
      templateUrl: 'common/header/header.tpl.html'
    state = $stateProvider.state stateName, stateData

  headerServiceProvider
)
