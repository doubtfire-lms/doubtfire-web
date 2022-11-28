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
      msg: $sce.getTrustedHtml(msg)
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

  alertService.reportError = (response) ->
    message = response.error
    if !message
      message = response.data?.error
    if !message
      message = response
    if message.error?
      message = message.error

    switch(response.status)
      when 401
        message = "You are not authorised to perform this action.<br />#{message}"
      when 403
        message = "You are not authorised to perform this action.<br />#{message}"
      when 500
        message = "An error has occurred. Please try again later.<br />#{message}"
      when 404
        message = "The requested resource was not found.<br />#{message}"
      when 400
        message = "The request was invalid.<br />#{message}"
      when 419
        message = "Your session has expired. Please log in again."
      else
        message = "An error has occurred.<br />#{message}"

    alertService.add "danger", message, 6000

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
