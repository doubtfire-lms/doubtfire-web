angular.module("doubtfire.common.services.dates", [])
#
# Services for making alerts
#
.factory("dateService", ->

  dateService = {}

  monthNames = [
    "Jan", "Feb", "Mar",
    "Apr", "May", "Jun", "Jul",
    "Aug", "Sep", "Oct",
    "Nov", "Dec"
  ]

  dateService.showDate = (dateValue) ->
    date = new Date(dateValue)
    "#{monthNames[date.getMonth()]} #{date.getFullYear()}"

  dateService
)
