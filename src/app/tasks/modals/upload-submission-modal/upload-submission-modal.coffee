angular.module('doubtfire.tasks.modals.upload-submission-modal', [])

#
# A modal to run through uploading a submission
#
.factory('UploadSubmissionModal', ($modal, alertService) ->
  UploadSubmissionModal = {}

  #
  # Open a grade task modal with the provided task
  #
  UploadSubmissionModal.show = (task) ->
    # Refuse to open modal if group task and not in a group
    if task.isGroupTask() && !task.inAGroup()
      alertService.show('alert', "This is a group assignment. Join a #{task.definition.group_set.name} group set to submit this task.", 8000)
      return null
    $modal.open
      templateUrl: 'tasks/modals/upload-submission-modal/upload-submission-modal.tpl.html'
      controller: 'UploadSubmissionModalCtrl'
      size: 'lg'
      resolve:
        task: -> task
        reuploadEvidence: -> if reuploadEvidence? then reuploadEvidence else false

  UploadSubmissionModal
)
.controller('UploadSubmissionModalCtrl', ($scope, $modalInstance, Task, taskService, task, reuploadEvidence, groupService, projectService, alertService) ->
  # Expose task to scope
  $scope.task = task

  # Set up submission types
  submissionTypes = _.map(taskService.submittableStatuses, (status) ->
    { id: status, label: taskService.statusLabels[status] }
  )
  if $scope.task.canReuploadEvidence()
    submissionTypes.concat({ id: 'reupload_evidence', label: 'New Evidence' })
  $scope.submissionTypes = submissionTypes

  # Load in submission type
  idToLoad = if reuploadEvidence then 'reupload_evidence' else $scope.task.status
  $scope.submissionType = _.find(submissionTypes, { id: idToLoad }).id

  # Upload files
  $scope.uploader = {
    url: Task.generateSubmissionUrl($scope.task.project(), $scope.task)
    files: _.each(task.definition.upload_requirements, (file) ->
      { name: file.name, type: file.type }
    )
    payload: {}
    isUploading: null # initialised by uploader
    isReady: null # initialised by uploader
    initiateUpload: null # initialised by uploader
    onBeforeUpload: ->
    onSuccess: ->
    onFailure: ->
  }

  # Each 'state' or 'step' in the wizard
  states = ['group', 'files', 'alignment', 'comments']

  # Remove any states we should not show
  states = _.without(states, 'group') unless task.isGroupTask()
  states = _.without(states, 'alignment') unless task.unit().task_outcome_alignments.length > 0

  # State index and active state set
  activeStateIdx = ->
    states.indexOf(activeState)
  activeState = null
  setActiveState = (state) ->
    activeState = state
  setActiveState(_.first(states))

  # Whether to apply ng-hide to state
  $scope.isHidden = (state) ->
    { left: states.indexOf(state) < activeStateIdx(), right: states.indexOf(state) > activeStateIdx() }

  # Go to next or previous state
  $scope.goToState = {
    next: ->
      setActiveState(states[activeStateIdx() + 1])
    previous: ->
      setActiveState(states[activeStateIdx() - 1])
  }

  # Whether or not we should disable this button
  $scope.shouldDisableBtn = {
    next: ->
      shouldDisableByState = {
        # Disable group if group members not allocated anything
        group: ->
          false
        # Disable alignment if no alignments made (need at least 1)
        alignment: ->
          false
        # Disable files if no files made
        files: ->
          !$scope.uploader.isReady
      }
      shouldDisableByState[activeState]?() || false
    back: ->
      false
    submit: ->
      false
    cancel: ->
      false # TODO: false if is uploading
  }

  # Whether or not we should show this button
  $scope.shouldShowBtn = {
    cancel: ->
      true # TODO: false if is uploading
    next: ->
      states[activeStateIdx() + 1]?
    back: ->
      states[activeStateIdx() - 1]?
    submit: ->
      # Show submit only if last state
      (states.length - 1) == activeStateIdx()
  }

)
