_ = require('underscore')

#
# Default state for a new project
#
mod = angular.module('doubtfire.projects.states.show', [])

.config((headerServiceProvider) ->
  projectsShowStateData =
    url: "/projects/:projectId?unitRole"
    views:
      main:
        controller: "ProjectsShowCtrl"
        template: require('./show.tpl.html')
    data:
      pageTitle: "_Home_"
      roleWhitelist: ['Student', 'Tutor', 'Convenor', 'Admin']
  headerServiceProvider.state "projects#show", projectsShowStateData
)

.controller("ProjectsShowCtrl", ($scope, $stateParams, currentUser, UnitRole, Project, projectService, alertService, analyticsService) ->
  analyticsService.event 'Student Project View', 'Started Viewing Project'

  if $stateParams.authToken?
    # $scope.message = $stateParams.authToken
    currentUser.authenticationToken = $stateParams.authToken

  # Provided show task id
  if $stateParams.showTaskId?
    $scope.showTaskId = parseInt($stateParams.showTaskId, 10)

  $scope.unitRole = $stateParams.unitRole

  if $scope.unitRole?
    # Bound to inner-directive
    UnitRole.get { id: $scope.unitRole },
      (response) ->
        $scope.assessingUnitRole = response
      (error) ->
        $scope.assessingUnitRole = null
        $scope.unitRole = null
  else
    $scope.assessingUnitRole = null

  # Bound to inner-directive
  $scope.project = { project_id: $stateParams.projectId }

  # Bound to inner-directive
  $scope.unit = null

  #
  # Batch Discuss button
  #
  $scope.transitionWeekEnd = () ->
    # Reject if there is no project
    return unless $scope.project?
    Project.update(
      { id: $scope.project.project_id, trigger: "trigger_week_end" }
      (project) ->
        projectService.updateTaskStats($scope.project, project.stats)
        # Update the task stats
        _.each $scope.project.tasks, (task) ->
          task.status = _.filter(project.tasks, { task_definition_id: task.task_definition_id })[0].status
        alertService.add("success", "Status updated.", 2000)
        analyticsService.event 'Student Project View', "Transitioned Week End"
      (response) -> alertService.add("danger", response.data.error, 6000)
    )
)

module.exports = mod.name
