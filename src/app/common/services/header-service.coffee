angular.module("doubtfire.services.header", [])
.factory("headerService", ($rootScope) ->

  # use the menus here to inject non-global menus
  # dynamically to a page (i.e., page-specific menus such as "role")

  # menuLinks = [ { class: 'active/nil', url: '/someUrl', name: 'Link Title' } ... ]
  # menu      = { name: 'Menu Title', links: menuLinks, icon: 'icon' }

  $rootScope.header_menu_data = [ ]
  
  menus: () -> $rootScope.header_menu_data
  clearMenus: ->
    $rootScope.header_menu_data.length = 0
  setMenus: (new_menus) ->
    $rootScope.header_menu_data.length = 0
    $rootScope.header_menu_data.push menu for menu in new_menus
  push: (new_menu) ->
    # push only if adding unique name
    $rootScope.header_menu_data.push new_menu if (menu for menu in $rootScope.header_menu_data when menu.name is new_menu.name).length == 0
)