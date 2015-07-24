angular.module("doubtfire.services.alerts", [])
#
# Services for making alerts
#
.factory("alertService", ($rootScope, $timeout, $sce) ->
  $rootScope.alerts = []

  alertSvc =
    add: (type, msg, timeout) ->
      $rootScope.alerts.push(
        type: type,
        msg: $sce.trustAsHtml(msg),
        close: ->
          alertSvc.closeAlert(this)
      )
      if (timeout)
        $timeout( ->
          alertSvc.closeAlert(this)
        , timeout)
    closeAlert: (alert) ->
      this.closeAlertIdx($rootScope.alerts.indexOf(alert))
    closeAlertIdx: (index) ->
      $rootScope.alerts.splice(index, 1)
    clear: ->
      $rootScope.alerts = []
) # end factory