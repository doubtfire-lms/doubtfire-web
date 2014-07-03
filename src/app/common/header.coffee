angular.module("doubtfire.header", [  ])

.factory("headerService", ($rootScope) ->

  $rootScope.header_menu_data = [ ]
  menus: () -> $rootScope.header_menu_data
  clearMenus: ->
    $rootScope.header_menu_data.length = 0
  setMenus: (new_menus) ->
    $rootScope.header_menu_data.length = 0
    $rootScope.header_menu_data.push menu for menu in new_menus
    
)

.factory("alertService", ($rootScope, $timeout) ->
  $rootScope.alerts = []

  alertSvc =
    add: (type, msg, timeout) ->
      $rootScope.alerts.push(
        type: type,
        msg: msg,
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


.controller("BasicHeaderCtrl", ($scope, $state, currentUser, headerService, Project) ->
  $scope.name = currentUser.profile.name
  $scope.nickname = currentUser.profile.nickname

  $scope.menus = headerService.menus()
)

.controller("BasicSidebarCtrl", ($scope, $state, currentUser, headerService, UnitRole, Project) ->
  $scope.unitRoles = UnitRole.query()
  $scope.projects = Project.query()

  $scope.isTutor = (userRole) ->
    userRole.role == "Tutor"
  $scope.isConvenor = (userRole) ->
    userRole.role == "Convenor"
)