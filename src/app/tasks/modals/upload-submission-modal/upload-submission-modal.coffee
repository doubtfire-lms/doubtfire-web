angular.module('doubtfire.tasks.modals.upload-submission-modal', [])

#
# A modal to run through uploading a submission
#
.factory('UploadSubmissionModal', ($modal, alertService) ->
  UploadSubmissionModal = {}
  #
  # Open a grade task modal with the provided task
  #
  UploadSubmissionModal.show = (task, reuploadEvidence, isTestSubmission = false) ->
    # Refuse to open modal if group task and not in a group
    if !isTestSubmission && task.isGroupTask() && !task.group
      alertService.add('danger', "This is a group task. Join a #{task.definition.groupSet.name} group to submit this task.", 8000)
      return null

    if isTestSubmission
      task.canReuploadEvidence = -> false
      # task.definition = {id: task.id, abbreviation: task.abbreviation, upload_requirements: task.uploadRequirements}
      # task.project = -> project
      task.isTestSubmission = isTestSubmission

    $modal.open
      templateUrl: 'tasks/modals/upload-submission-modal/upload-submission-modal.tpl.html'
      controller: 'UploadSubmissionModalCtrl'
      size: 'lg'
      keyboard: false
      backdrop: 'static'
      resolve:
        task: -> task
        reuploadEvidence: -> reuploadEvidence

  UploadSubmissionModal
)
.controller('UploadSubmissionModalCtrl', ($scope, $rootScope, $timeout, $modalInstance, newTaskService, task, reuploadEvidence, alertService, outcomeService, PrivacyPolicy) ->
  $scope.privacyPolicy = PrivacyPolicy
  # Expose task to scope
  $scope.task = task

  # Set up submission types
  submissionTypes = _.chain(newTaskService.submittableStatuses).map((status) ->
    [ status, newTaskService.statusLabels.get(status) ]
  ).fromPairs().value()

  if $scope.task.inSubmittedState()
    submissionTypes['reupload_evidence'] = 'New Evidence'

  # Load in submission type
  if $scope.task.isTestSubmission
    $scope.submissionType = 'test_submission'
    submissionTypes = {'test_submission': 'Test Submission'}
    # submissionTypes['test_submission'] = 'Test Submission'
  else
    $scope.submissionType = if reuploadEvidence then 'reupload_evidence' else $scope.task.status

  $scope.submissionTypes = submissionTypes

  # Upload files
  $scope.uploader = {
    # url: Task.generateSubmissionUrl($scope.task.project, $scope.task)
    url: if $scope.task.isTestSubmission then $scope.task.testSubmissionUrl() else $scope.task.submissionUrl()
    files: _.chain(task.definition.uploadRequirements).map((file) ->
      [file.key, { name: file.name, type: file.type }]
    ).fromPairs().value()
    payload: {}
    isUploading: null # initialised by uploader
    isReady: null # initialised by uploader
    start: null # initialised by uploader
    onBeforeUpload: ->
      $scope.uploader.payload.contributions = mapTeamToPayload() if _.includes(states.shown, 'group')
      $scope.uploader.payload.alignment_data = mapAlignmentDataToPayload() if _.includes(states.shown, 'alignment')
      $scope.uploader.payload.trigger = 'need_help' if $scope.submissionType == 'need_help'
    onSuccess: (response) ->
      $scope.uploader.response = response
    onFailureCancel: $modalInstance.dismiss
    onComplete: ->
      $modalInstance.close(task)
      unless $scope.task.isTestSubmission
        # Add comment if requested
        task.addComment($scope.comment) if $scope.comment.trim().length > 0
      # Broadcast that upload is complete
      $rootScope.$broadcast('TaskSubmissionUploadComplete', task)
      # Perform as timeout to show 'Upload Complete'
      $timeout((->
        unless $scope.task.isTestSubmission
          response = $scope.uploader.response
          expectedStatus = if ["need_help", "ready_for_feedback"].includes($scope.submissionType) then $scope.submissionType else response.status

          $scope.task.updateFromJson(response, newTaskService.mapping)

          $scope.task.processTaskStatusChange(expectedStatus, alertService)
      ), 1500)
  }

  # States functionality
  states = {
    # All possible states
    all: ['group', 'files', 'alignment', 'comments', 'uploading']
    # Only states which are shown (populated in initialise)
    shown: []
    # The currently active state (set in initialise)
    active: null
    # Current index of the active state
    activeIdx: -> states.shown.indexOf(states.active)
    # Sets the active state
    setActive: (state) -> states.active = state
    # Sets the active state to the next state that should be shown
    next: -> states.setActive(states.shown[states.activeIdx() + 1])
    # Sets the active state to the previous state that should be shown
    previous: -> states.setActive(states.shown[states.activeIdx() - 1])
    # Decides whether this state is hidden to the left or right of the active state
    isHidden: (state) -> {
      left: states.shown.indexOf(state) < states.activeIdx(),
      right: states.shown.indexOf(state) > states.activeIdx()
    }
    # Conditions on which to remove specific states
    removed: ->
      # Only show some states if RFF
      isRFF = $scope.submissionType == 'ready_for_feedback'
      isTestSubmission = $scope.submissionType == 'test_submission'
      removed = []
      # Remove group and alignment states
      removed.push('group') if !isRFF || !task.isGroupTask()
      removed.push('alignment') if !isRFF || !task.unit.ilos.length > 0
      removed.push('comments') if isTestSubmission
      removed
    # Initialises the states
    initialise: ->
      # Each 'state' or 'step' in the wizard
      states.shown = _.difference(states.all, states.removed())
      states.setActive(_.first(states.shown))
  }
  states.initialise()

  # If the submission type changes, then modify status (if applicable) and
  # reinitialise states
  $scope.onSelectNewSubmissionType = (newType) ->
    # Only change status if not reuploading evidence
    $scope.task.status = newType unless newType == 'reupload_evidence'
    $scope.submissionType = newType
    states.initialise()

  # Whether to apply ng-hide to state
  $scope.isHidden = states.isHidden

  # Go to next or previous state
  $scope.goToState = {
    next: states.next
    previous: states.previous
  }

  # Whether or not we should disable this button
  $scope.shouldDisableBtn = {
    next: ->
      shouldDisableByState = {
        # Disable group if group members not allocated anything
        group: ->
          _.chain($scope.team.memberContributions).map('confRating').compact().value().length == 0
        # Disable alignment if no alignments made (need at least 1) and
        # if description is blank
        alignment: ->
          _.chain($scope.alignments).map('rating').compact().value().length == 0 ||
          $scope.alignmentsRationale.trim().length == 0
        # Disable files if no files made
        files: ->
          !$scope.uploader.isReady
      }
      shouldDisableByState[states.active]?() || false
    back: ->
      false
    submit: ->
      # Disable if no comment is supplied with need_help
      !$scope.uploader.isReady || ($scope.comment.trim().length == 0 && $scope.submissionType == 'need_help')
    cancel: ->
      # Can't cancel whilst uploading
      $scope.uploader.isUploading
  }

  # Whether or not we should show this button
  $scope.shouldShowBtn = {
    cancel: ->
      # Can't cancel whilst uploading
      !$scope.uploader.isUploading
    next: ->
      nextState = states.shown[states.activeIdx() + 1]
      nextState? && nextState != 'uploading'
    back: ->
      prevState = states.shown[states.activeIdx() - 1]
      prevState? && prevState != 'uploading'
    submit: ->
      # Show submit only if state before uploading
      states.activeIdx() == states.shown.indexOf('uploading') - 1
  }

  # Click upload on UI
  $scope.uploadButtonClicked = ->
    # Move files to the end to simulate as though state move
    states.shown = _.without(states.shown, 'files')
    states.shown.push('files')
    $timeout((->
      states.setActive('files')
      $scope.uploader.start()
    ), 251)

  # Team for group state (populated by assignment rater)
  $scope.team = { memberContributions: [] }

  # Maps team data to payload data
  mapTeamToPayload = ->
    total = task.group.contributionSum($scope.team.memberContributions)
    _.map($scope.team.memberContributions,
      (member) -> {
        project_id: member.project.id,
        pct: (100 * member.rating / total).toFixed(0),
        pts: member.rating
      }
    )

  # Comment on the task
  $scope.comment = ""

  # Maps the alignment data to payload data
  mapAlignmentDataToPayload = ->
    _.chain($scope.alignments)
    .map((alignment, key) ->
      alignment.rationale = $scope.alignmentsRationale
      alignment.ilo_id = +key
      alignment
    )
    .filter((alignment) ->
      alignment.rating > 0
    )
    .value()

  unless $scope.task.isTestSubmission
    # Get initial alignment data...
    initialAlignments = task.project.taskOutcomeAlignments.filter( (a) -> a.taskDefinition.id == task.definition.id )
    # ILO alignment defaults
    $scope.alignmentsRationale = if initialAlignments.length > 0 then initialAlignments[0].description else ""
    staffAlignments = $scope.task.staffAlignments()
    $scope.ilos = _.map(task.unit.ilos, (ilo) ->
      staffAlignment = _.find(staffAlignments, (sa) -> sa.learningOutcome.id ==  ilo.id)
      staffAlignment ?= {}
      staffAlignment.rating ?= 0
      staffAlignment.label = outcomeService.alignmentLabels[staffAlignment.rating]
      ilo.staffAlignment = staffAlignment
      ilo
    )
    $scope.alignments = _.chain(task.unit.ilos)
      .map((ilo) ->
        value = initialAlignments.filter((a) -> a.learningOutcome.id == ilo.id)?[0]?.rating
        value ?= 0
        [ilo.id, {rating: value }]
      )
      .fromPairs()
      .value()
  else
    $scope.ilos = []
    $scope.alignments = []
    $scope.alignmentsRationale = ""
)
