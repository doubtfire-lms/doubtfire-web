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

  taskService.statusLabels = {
    'ready_to_mark':      'Ready to Mark',
    'not_submitted':      'Not Started',
    'working_on_it':      'Working On It',
    'need_help':          'Need Help',
    'redo':               'Redo',
    'fix_and_include':    "Don't resubmit",
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
    'discuss':            'fa fa-comment',
    'complete':           'fa fa-check-circle-o'
  }

  # This function gets the status CSS class for the indicated status
  taskService.statusClass = (status) -> _.trim(_.dasherize(status))
  
  # This function gets the status text for the indicated status
  taskService.statusText = (status) -> taskService.statusLabels[status]

  # Return an icon and label for the task
  taskService.statusData = (task) ->
    { icon: taskService.statusIcons[task.status], label: taskService.statusLabels[task.status] }

  taskService
)