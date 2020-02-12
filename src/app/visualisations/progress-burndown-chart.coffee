angular.module('doubtfire.visualisations.progress-burndown-chart', [])
.directive 'progressBurndownChart', ->
  restrict: 'E'
  templateUrl: 'visualisations/visualisation.tpl.html'
  scope:
    project: '='
    unit: '='
  controller: ($scope, Visualisation, listenerService) ->
    listeners = listenerService.listenTo($scope)

    $scope.data = []

    listeners.push $scope.$watch 'project.burndown_chart_data', (newValue) ->
      return unless newValue?
      now = +new Date().getTime() / 1000
      timeSeries =
        key: "NOW",
        values: [
          [now, 0]
          [now, 1]
        ]
        color: '#CACACA'
        classed: 'dashed'
      newValue.push timeSeries unless _.find newValue, {key: 'NOW'}
      $scope.data.length = 0
      _.extend $scope.data, newValue
      if $scope.api?
        $scope.api.refresh()
      null

    xAxisTickFormatDateFormat = (d) ->
      d3.time.format('%b %d')(new Date(d * 1000))

    yAxisTickFormatPercentFormat = (d) ->
      d3.format(',%')(d)

    colorFunction = (d, i) ->
      if i == 0 #projeted
        '#AAAAAA'
      else if i == 1 #target
        '#777777'
      else if i == 2 #done
        '#0079d8'
      else #sign off
        '#E01B5D'

    #
    # No need to clip x axis
    #
    xAxisClipNegBurndown = (d) ->
      d[0]

    #
    # Clips y to 0 if y < 0
    #
    yAxisClipNegBurndown = (d) ->
      if d[1] < 0.0 then 0 else d[1]

    #
    # Graph unit dates as moment.js dates
    #
    dates = {
      start: moment($scope.unit.start_date)
      # represent the graph as 2 weeks after the unit's end date
      end:   moment($scope.unit.end_date).add(2, 'weeks')
    }

    #
    # Converts a moment date to a Unix Time Stamp in seconds
    #
    toUnixTimestamp = (momentDate) ->
      +momentDate / 1000

    #
    # X domain is defined as the unit's start date to the unit's end date add two weeks
    #
    xDomain = [
      toUnixTimestamp(dates.start),
      toUnixTimestamp(dates.end)
    ]

    [$scope.options, $scope.config] = Visualisation 'lineChart', 'Student Progress Burndown Chart', {
      useInteractiveGuideline: yes
      interactiveLayer:
        tooltip:
          contentGenerator: (data) ->
            # Need to generate this so as to not include NOW key
            date = data.value
            series = data.series
            html = "<table class='col-sm-6'><thead><tr><td colspan='3'><strong class='x-value'>#{date}</strong></td></tr></thead><tbody>"
            html += ("<tr><td class='legend-color-guide'><div style='background-color: #{d.color};'></div></td><td class='key'>#{d.key}</td><td class='value'>#{d3.format(',%')(d.value)}</td></tr><tr>" for d in series when d.key isnt 'NOW').join('')
            html += "</tbody></table>"
            html
      height: 440
      margin:
        left: 75
        right: 50
      xAxis:
        axisLabel: "Time"
        tickFormat: xAxisTickFormatDateFormat
        ticks: 8
      yAxis:
        axisLabel: "Tasks Remaining"
        tickFormat: yAxisTickFormatPercentFormat
      color: colorFunction
      legendColor: colorFunction
      x: xAxisClipNegBurndown
      y: yAxisClipNegBurndown
      yDomain: [0, 1]
      xDomain: xDomain
    }, {}
