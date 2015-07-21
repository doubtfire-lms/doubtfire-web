angular.module("doubtfire.header", ["doubtfire.units.partials.modals"])

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

.factory("alertService", ($rootScope, $timeout, $sce) ->
  $rootScope.alerts = []

  alertSvc =
    add: (type, msg, timeout) ->
      $rootScope.alerts.push(
        type: type,
        msg: $sce.trustAsHtml(msg),
        close: ->
          alertSvc.closeAlert(this)
      )
      if (timeout)
        $timeout( ->
          alertSvc.closeAlert(this)
        , timeout)
    closeAlert: (alert) ->
      this.closeAlertIdx($rootScope.alerts.indexOf(alert))
    closeAlertIdx: (index) ->
      $rootScope.alerts.splice(index, 1)
    clear: ->
      $rootScope.alerts = []
) # end factory


.controller("BasicHeaderCtrl", ($scope, $state, $modal, currentUser, headerService, UnitRole, User, Project) ->
  # $scope.currentUser = {}
  # $scope.currentUser.nickname = currentUser.profile.nickname
  # $scope.currentUser.name = currentUser.profile.name
  $scope.menus = headerService.menus()
  $scope.currentUser = currentUser.profile

  # Global Units Menu
  $scope.unitRoles = UnitRole.query()
  $scope.projects = Project.query()

  $scope.isUniqueUnitRole = (unit) ->
    units = (item for item in $scope.unitRoles when item.unit_id is unit.unit_id)
    # teaching userRoles will default to tutor role if both convenor and tutor
    units.length == 1 || unit.role == "Tutor"

  $scope.openUserSettings = () ->
    $modal.open
      templateUrl: 'users/partials/templates/user-modal-context.tpl.html'
      controller: 'UserModalCtrl'
      resolve:
        # Actually load in all current user info when we request the user settings
        user: ->  $scope.currentUser
        isNew: -> false
        users: -> false

  $scope.openNotificationSettings = () ->
    $modal.open
      templateUrl: 'users/partials/templates/user-notification-settings.tpl.html'
      controller: 'UserNotificationSettingsModalCtrl'
      resolve:
        # Actually load in all current user info when we request the user settings
        user: ->  $scope.currentUser

  $scope.openAboutModal = ->
    $modal.open
      templateUrl: 'common/about-doubtfire-modal.tpl.html'
      controller: 'AboutDoubtfireModalCtrl'
      size: 'lg'
)

.controller("ErrorHeaderCtrl", ($scope, $state, $modal, currentUser, headerService, UnitRole, User, Project) ->
  $scope.menus = headerService.menus()
  $scope.currentUser = currentUser.profile
)


.controller("BasicSidebarCtrl", ($scope, $state, currentUser, headerService, UnitRole, Project) ->
  $scope.unitRoles = UnitRole.query()
  $scope.projects = Project.query()

  $scope.isTutor = (userRole) ->
    userRole.role == "Tutor"
  $scope.isConvenor = (userRole) ->
    userRole.role == "Convenor"
)

.controller('AboutDoubtfireModalCtrl', ($scope, DoubtfireContributors, $modalInstance, $http, $q) ->
  contributors = DoubtfireContributors
  # initial data
  $scope.contributors = _.map contributors, (c) ->
    avatar:   '/assets/images/person-unknown.gif'
    handler:  c
  $scope.close = ->
    $modalInstance.dismiss()
  for handler, index in contributors
    do (handler, index) ->
      $http.get("https://api.github.com/users/#{handler}").then (response) ->
        data = response.data
        if data.blog
          data.blog = 'http://' + data.blog unless data.blog.match /^[a-zA-Z]+:\/\//
        $scope.contributors[index] =
          name:     data.name
          avatar:   data.avatar_url or '/assets/images/person-unknown.gif'
          website:  data.blog or data.html_url
          github:   data.html_url
          handler:  handler
)