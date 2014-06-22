angular.module("doubtfire.header", [  ])

.factory("headerService", ($rootScope) ->

  $rootScope.links_data = [ ]

  links: () -> $rootScope.links_data
  clearLinks: ->
    $rootScope.links_data.length = 0
  setLinks: (new_links) ->
    $rootScope.links_data.length = 0
    $rootScope.links_data.push link for link in new_links
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


.controller("BasicHeaderCtrl", ($scope, $state, currentUser, headerService) ->
  $scope.name = currentUser.profile.name
  $scope.nickname = currentUser.profile.nickname

  $scope.links = headerService.links()
)

.controller("BasicSidebarCtrl", ($scope, $state, currentUser, headerService, UnitRole, Project) ->
  $scope.unitRoles = UnitRole.query()
  $scope.projects = Project.query()

  $scope.isTutor = (userRole) ->
    userRole.role == "Tutor"
  $scope.isConvenor = (userRole) ->
    userRole.role == "Convenor"
)