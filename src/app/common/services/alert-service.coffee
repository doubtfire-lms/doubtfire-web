angular.module("doubtfire.common.services.alerts", [])
#
# Services for making alerts
#
.factory("alertService", ($rootScope, $timeout, $sce) ->
  # Underlying root alerts
  $rootScope.alerts = []

  alertService = {}

  #
  # Add a new alert of the given type (primary, danger, warning, info)
  # with the specified message and timeout.
  #
  # If no timeout is specified the message will not automatically dismiss
  #
  alertService.add = (type, msg, timeout) ->
    closeThisAlertFunc = ->
      alertService.closeAlert(this)

    alertData = {
      type: type
      msg: $sce.trustAsHtml(msg)
      close: closeThisAlertFunc
    }

    # Push to the root alerts
    $rootScope.alerts.unshift(alertData)

    # When a timeout is specified, call the close function of this alert
    # when the time is up
    $timeout closeThisAlertFunc, timeout if _.isNumber(timeout) and timeout > 0

  #
  # Close a specific alert
  #
  alertService.closeAlert = (alert) ->
    this.closeAlertIdx($rootScope.alerts.indexOf(alert))

  #
  # Close an alert at a specified index
  #
  alertService.closeAlertIdx = (index) ->
    $rootScope.alerts.splice(index, 1)

  #
  # Clear all alerts
  #
  alertService.clearAll = ->
    $rootScope.alerts = []

  alertService
)
