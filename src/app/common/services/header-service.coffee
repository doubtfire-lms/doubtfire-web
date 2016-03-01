angular.module("doubtfire.common.services.header", [])
#
# Service for handling the header
#
.factory("headerService", ($rootScope) ->
  # Internal object that stores the menus
  $rootScope.headerMenuData = [ ]

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
    $rootScope.headerMenuData.length = 0

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
)
