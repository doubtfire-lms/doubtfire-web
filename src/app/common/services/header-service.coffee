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
    $rootScope.headerMenuData = []
    # Internal object that stores the visbility of the header
    $rootScope.showHeader = true

    headerService = {}

    #
    # Returns the current menus
    #
    headerService.getMenus = ->
      $rootScope.headerMenuData

    #
    # Clears all menus in the header
    #
    headerService.clearMenus = ->
      $rootScope.headerMenuData = []

    #
    # Set new menus where:
    #
    #   menuLinks = [ { class: 'active' or undefined, url: '/someUrl', name: 'Link Title' } ... ]
    #   newMenus  = [{ name: 'Menu Title', links: menuLinks, icon: 'icon' } ... ]
    #
    headerService.setMenus = (newMenus) ->
      $rootScope.headerMenuData = newMenus

    #
    # Push a new menu to the header where:
    #
    #   menuLinks = [ { class: 'active' or undefined, url: '/someUrl', name: 'Link Title' } ... ]
    #   newMenu   = { name: 'Menu Title', links: menuLinks, icon: 'icon' }
    #
    headerService.pushMenu = (newMenu) ->
      # Add the new menu only if it's unique (by name)
      unless _.find $rootScope.headerMenuData, { 'name': newMenu.name } is undefined
        $rootScope.headerMenuData.push newMenu

    #
    # Show the header
    #
    headerService.showHeader = ->
      $rootScope.showHeader = true

    #
    # Hide the header
    #
    headerService.hideHeader = ->
      $rootScope.showHeader = false

    headerService

  #
  # A provider that instantiates a new state with a header
  # Requires that stateData has at least one view
  #
  headerServiceProvider.state = (stateName, stateData, controller = 'BasicHeaderCtrl') ->
    throw new Error "stateData must have at least one view" unless stateData.views?
    stateData.views.header =
      controller: controller
      templateUrl: 'common/header/header.tpl.html'
    state = $stateProvider.state stateName, stateData
  headerServiceProvider
)
