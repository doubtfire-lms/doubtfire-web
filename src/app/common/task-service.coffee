angular.module("doubtfire.task-service", [  ])

.factory("taskService", () ->
  #
  # The unit service object
  #
  taskService = {}

  taskService.statusKeys = [
    'not_submitted',
    'fix_and_include',
    'redo',
    'need_help',
    'working_on_it',
    'fix_and_resubmit',
    'ready_to_mark',
    'discuss',
    'complete'
  ]

  taskService.acronymKey = {
    'RTM': 'ready_to_mark',
    'NOS': 'not_submitted',
    'WRK': 'working_on_it',
    'HLP': 'need_help',
    'RDO': 'redo',
    "DNR": 'fix_and_include',
    'FIX': 'fix_and_resubmit',
    'DIS': 'discuss',
    'COM': 'complete'
  }

  taskService.statusAcronym = {
    'ready_to_mark':      'RTM',
    'not_submitted':      'NOS',
    'working_on_it':      'WRK',
    'need_help':          'HLP',
    'redo':               'RDO',
    'fix_and_include':    "DNR",
    'fix_and_resubmit':   'FIX',
    'discuss':            'DIS',
    'complete':           'COM'
  }

  taskService.statusLabels = {
    'ready_to_mark':      'Ready to Mark',
    'not_submitted':      'Not Started',
    'working_on_it':      'Working On It',
    'need_help':          'Need Help',
    'redo':               'Redo',
    'fix_and_include':    "Do Not Resubmit",
    'fix_and_resubmit':   'Resubmit',
    'discuss':            'Discuss',
    'complete':           'Complete'
  }

  taskService.statusIcons = {
    'ready_to_mark':      'fa fa-thumbs-o-up',
    'not_submitted':      'fa fa-times',
    'working_on_it':      'fa fa-bolt',
    'need_help':          'fa fa-question-circle',
    'redo':               'fa fa-refresh',
    'fix_and_include':    'fa fa-stop',
    'fix_and_resubmit':   'fa fa-wrench',
    'discuss':            'fa fa-check',
    'complete':           'fa fa-check-square-o'
  }

  taskService.helpTextDesc = {
    'ready_to_mark':      'Task yet to be marked.',
    'not_submitted':      'Task yet to be started.',
    'working_on_it':      'Indicate to your tutor that you\'re working on this task.',
    'need_help':          'Indicate to your tutor that you need help on this task.',
    'redo':               'Your tutor wants you to start this task from scratch.',
    'fix_and_include':    'Your tutor wants you to stop submitting this task and include it fixed in your portfolio.',
    'fix_and_resubmit':   'Your tutor wants you to fix something and resubmit it for review again.',
    'discuss':            'Your tutor is happy with your work. To mark as complete, attend the lab and discuss it with your tutor.',
    'complete':           'Your tutor is happy with your work and it has been discussed with them.'
  }

  # This function gets the status CSS class for the indicated status
  taskService.statusClass = (status) -> _.trim(_.dasherize(status))
  
  # This function gets the status text for the indicated status
  taskService.statusText = (status) -> taskService.statusLabels[status]

  # This function gets the help text for the indicated status
  taskService.helpText = (status) -> taskService.helpTextDesc[status]

  # Return an icon and label for the task
  taskService.statusData = (task) ->
    { icon: taskService.statusIcons[task.status], label: taskService.statusLabels[task.status] }

  taskService.indexOf = (status) ->
    _.indexOf(taskService.statusKeys, status)

  # Return a list of all the the status values and icons
  taskService.allStatusData = () ->
    result = []
    angular.forEach taskService.statusKeys, (sk) ->
      result.push({ icon: taskService.statusIcons[sk], label: taskService.statusLabels[sk], class: taskService.statusClass(sk) })
    result

  taskService
)