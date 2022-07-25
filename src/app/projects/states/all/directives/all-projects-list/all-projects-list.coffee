angular.module('doubtfire.projects.states.all.directives.all-projects-list', [])

.config(($stateProvider) ->
  homeStateData =
    url: "/view-all-projects"
    views:
      main:
        controller: "AllProjectsList"
        templateUrl: "projects/states/all/directives/all-projects-list/all-projects-list.tpl.html"
    data:
      pageTitle: "_All-Projects_"
      roleWhitelist: ['Student', 'Tutor', 'Convenor', 'Admin']
  $stateProvider.state 'view-all-projects', homeStateData
)

.controller("AllProjectsList", ($scope, $state, $timeout, DoubtfireConstants, newProjectService, analyticsService, dateService, GlobalStateService, newUserService) ->
  analyticsService.event 'view-all-projects', 'viewed all-projects list'
  GlobalStateService.setView('OTHER')

  $scope.externalName = DoubtfireConstants.ExternalName

  # Table sort details
  $scope.sortOrder = "start_date"
  $scope.reverse = true

  # Pagination details
  $scope.currentPage = 1
  $scope.maxSize = 5
  $scope.pageSize = 15

  hasProjects = false

  timeoutPromise = $timeout((-> $scope.showSpinner = true), 2000)

  newProjectService.query(undefined, {params: {include_inactive: true}}).subscribe({
    next: (projects) ->
      $scope.projects = projects
      $scope.showSpinner = false
      $scope.dataLoaded = true
      hasProjects = true
      $timeout.cancel(timeoutPromise)
    error: (message) ->
      alertService.add("danger", "Failed to load units you study. #{message}", 6000)
  })

  checkEnrolled = ->
    return if !$scope.projects?
    $scope.notEnrolled = ->
      # Not enrolled if a student and no projects
      ($scope.projects.length is 0 and newUserService.currentUser.role is 'Student')

  $scope.$watch 'projects', checkEnrolled

  $scope.typeAhead = (projects) ->
    result = []
    _.each projects, (proj) ->
      result.push(proj.unit.code)
      result.push(proj.unit.name)
    return _.uniq(result)

  $scope.currentUser = newUserService.currentUser
)
