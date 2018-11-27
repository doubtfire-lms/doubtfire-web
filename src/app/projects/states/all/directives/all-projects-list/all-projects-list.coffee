angular.module('doubtfire.projects.states.all.directives.all-projects-list', [])

.config((headerServiceProvider) ->
  homeStateData =
    url: "/view-all-projects"
    views:
      main:
        controller: "AllProjectsList"
        templateUrl: "projects/states/all/directives/all-projects-list/all-projects-list.tpl.html"
    data:
      pageTitle: "_All-Projects_"
      roleWhitelist: ['Student', 'Tutor', 'Convenor', 'Admin']
  headerServiceProvider.state 'view-all-projects', homeStateData
)

.controller("AllProjectsList", ($scope, $state, $timeout, User, ExternalName, headerService, currentUser, projectService, analyticsService, dateService) ->
  analyticsService.event 'view-all-projects', 'viewed all-projects list'

  $scope.externalName = ExternalName

  # Table sort details
  $scope.sortOrder = "start_date"
  $scope.reverse = true

  # Pagination details
  $scope.currentPage = 1
  $scope.maxSize = 5
  $scope.pageSize = 15

  hasProjects = false

  timeoutPromise = $timeout((-> $scope.showSpinner = true), 2000)
  projectService.getProjects true, (projects) ->
    $scope.projects = projects
    $scope.showSpinner = false
    $scope.dataLoaded = true
    hasProjects = true
    $timeout.cancel(timeoutPromise)

  checkEnrolled = ->
    return if !$scope.projects?
    $scope.notEnrolled = ->
      # Not enrolled if a student and no projects
      ($scope.projects.length is 0 and currentUser.role is 'Student')

  $scope.$watch 'projects', checkEnrolled

  $scope.currentUser = currentUser
)
