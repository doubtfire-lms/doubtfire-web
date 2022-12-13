angular.module('doubtfire.admin.states.teachingperiods.edit', ['doubtfire.teaching-periods.states.edit.directives'])

.config(($stateProvider) ->
  teachingPeriodsAdminViewStateData =
    url: '/admin/teaching-periods/:teachingPeriodId'
    views:
      main:
        controller: 'EditTeachingPeriodStateCtrl'
        templateUrl: 'admin/states/teaching-periods/teaching-period-edit/edit-teaching-period.tpl.html'
    data:
      pageTitle: "_Teaching-Period Administration_"
      roleWhitelist: ['Admin']
  $stateProvider.state "admin/teachingperiods/edit", teachingPeriodsAdminViewStateData
)

.controller("EditTeachingPeriodStateCtrl", ($scope, $state, newTeachingPeriodService, alertService, analyticsService, GlobalStateService) ->
  analyticsService.event 'Edit Teaching Period View', "Started Edit Teaching Period View"

  GlobalStateService.setView("OTHER")

  GlobalStateService.onLoad () ->
    tpId = parseInt($state.params.teachingPeriodId, 10)
    newTeachingPeriodService.get(tpId).subscribe({
      next: (tp) -> $scope.teachingPeriod = tp
      error: (response) ->
        $scope.teachingPeriod = { id: -1 }
        $scope.newTeachingPeriod = true
    })
    #  || { id: -1 }
    # $scope.newTeachingPeriod = $scope.teachingPeriod.id == -1

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
