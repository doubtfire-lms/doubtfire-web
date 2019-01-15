angular.module('doubtfire.admin.states.teachingperiods.edit', ['doubtfire.teaching-periods.states.edit.directives'])

.config(($stateProvider, headerServiceProvider) ->
  teachingPeriodsAdminViewStateData =
    url: '/admin/teaching-periods/:teachingPeriodId'
    views:
      main:
        controller: 'EditTeachingPeriodStateCtrl'
        templateUrl: 'admin/states/teaching-periods/teaching-period-edit/edit-teaching-period.tpl.html'
    data:
      pageTitle: "_Teaching-Period Administration_"
      roleWhitelist: ['Admin']
  headerServiceProvider.state "admin/teachingperiods/edit", teachingPeriodsAdminViewStateData
)

.controller("EditTeachingPeriodStateCtrl", ($scope, $state, TeachingPeriod, alertService, analyticsService) ->
  analyticsService.event 'Edit Teaching Period View', "Started Edit Teaching Period View"

  TeachingPeriod.get( Number($state.params.teachingPeriodId)
    (success) ->
      $scope.teachingPeriod = success
      $scope.newTeachingPeriod = $scope.teachingPeriod.id == -1

    (failure) -> alertService.add("danger", "Failed to load teaching period. #{failure?.data?.error}", 6000)
  )

  #
  # Active tab group
  #
  $scope.tabs =
    editorTab:
      title: "Teaching Period Details Editor"
      seq:   0
    breaksTab:
      title: "Teaching Period Breaks"
      seq:   1
    unitsTab:
      title: "Rollover Teaching Period"
      seq:   2

  # Set the active tab
  $scope.setActiveTab = (tab) ->
    # Do nothing if we're switching to the same tab
    return if tab is $scope.activeTab

    # Actions to perform when changing tab
    $scope.activeTab?.active = false  # Deactivate original tab

    # run de-select actions...
    $scope.activeTab.deselect?()

    $scope.activeTab = tab            # Switch tabs
    $scope.activeTab.active = true    # Make it active

  $scope.activeTab = $scope.tabs.editorTab

)