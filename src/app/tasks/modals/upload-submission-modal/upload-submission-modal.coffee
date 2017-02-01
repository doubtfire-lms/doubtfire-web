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
    if task.isGroupTask() && !task.studentInAGroup()
      alertService.add('danger', "This is a group assignment. Join a #{task.definition.group_set.name} group set to submit this task.", 8000)
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
.controller('UploadSubmissionModalCtrl', ($scope, $modalInstance, Task, taskService, task, reuploadEvidence, groupService, projectService, alertService, outcomeService) ->
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

  # States functionality
  states = {
    # All possible states
    all: ['group', 'files', 'alignment', 'comments']
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
    # Initialises the states
    initialise: ->
      # Each 'state' or 'step' in the wizard
      states.shown = states.all
      # Only show some states if RTM
      isRtm = $scope.submissionType == 'ready_to_mark'
      # Remove group and alignment states
      removeGroupState = !isRtm || !task.isGroupTask()
      removeAlignState = !isRtm || !task.unit().ilos.length > 0
      states.shown = _.without(states.shown, 'group') if removeGroupState
      states.shown = _.without(states.shown, 'alignment') if removeAlignState
      states.setActive(_.first(states.shown))
  }
  states.initialise()

  # If the submission type changes, then modify status (if applicable) and
  # reinitialise states
  $scope.submissionTypeChanged = ->
    # Only change status if not reuploading evidence
    $scope.task.status = $scope.submissionType unless $scope.submissionType == 'reupload_evidence'
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
          _.chain($scope.team.members).map('confRating').compact().value().length == 0
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
      $scope.comment.trim().length == 0 && $scope.submissionType == 'need_help'
    cancel: ->
      false # TODO: false if is uploading
  }

  # Whether or not we should show this button
  $scope.shouldShowBtn = {
    cancel: ->
      true # TODO: false if is uploading
    next: ->
      states.shown[states.activeIdx() + 1]?
    back: ->
      states.shown[states.activeIdx() - 1]?
    submit: ->
      # Show submit only if last state
      (states.shown.length - 1) == states.activeIdx()
  }

  # Team for group state (populated by assignment rater)
  $scope.team = { members: [] }

  # Maps team data to payload data
  mapTeamToPayload = ->
    total = groupService.groupContributionSum($scope.team.members)
    _.map($scope.team.members,
      (member) -> {
        project_id: member.project_id,
        pct: (100 * member.rating / total).toFixed(0),
        pts: member.rating
      }
    )

  # Comment on the task
  $scope.comment = ""

  # Maps the alignment data to payload data
  mapAlignmentDataToPayload = ->
    _.map($scope.alignments, (alignment) ->
      alignment.rationale = $scope.alignmentsRationale
    )

  # ILO alignment defaults
  $scope.alignmentsRationale = ""
  staffAlignments = $scope.task.staffAlignments()
  $scope.ilos = _.map(task.unit().ilos, (ilo) ->
    staffAlignment = _.find(staffAlignments, {learning_outcome_id: ilo.id})
    staffAlignment ?= {}
    staffAlignment.rating ?= 0
    staffAlignment.label = outcomeService.alignmentLabels[staffAlignment.rating]
    ilo.staffAlignment = staffAlignment
    ilo
  )
  $scope.alignments = _.chain(task.unit().ilos)
    .map((ilo) ->
      [ilo.id, {rating: 0}]
    )
    .fromPairs()
    .value()
)
