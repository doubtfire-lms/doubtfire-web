angular.module('doubtfire.visualisations.progress-burndown-chart', [])
.directive 'progressBurndownChart', ->
  replace: true
  restrict: 'E'
  templateUrl: 'visualisations/partials/templates/visualisation.tpl.html'
  scope:
    project: '='
    unit: '='
  controller: ($scope, Visualisation) ->
    $scope.data = []

    $scope.$watch 'project.burndown_chart_data', (newValue) ->
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
    # Clips x values to be at the y = 0 intercept if y < 0
    #
    xAxisClipNegBurndown = (d) ->
      if d[1] < 0.0
        # find the x intercept at y = 0
        # know originX is the origin date of the graph (i.e. burnoff is still 100%)
        originX = $scope.project.burndown_chart_data[0].values[0][0]
        # work off the 100% point and this point
        [pt1x, pt1y] = [originX, 1]
        [pt2x, pt2y] = [d[0], d[1]]
        # find gradient
        m    = (pt2y - pt1y) / (pt2x - pt1x)
        # get actual y intercept
        c    = pt1y - m * pt1x
        # solve x intercept via 0 = mx+c
        -c/m
      else
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
    toUTS = (momentDate) ->
      +momentDate / 1000

    #
    # X domain is defined as the unit's start date to the unit's end date add two weeks
    #
    xDomain = [
      toUTS(dates.start),
      toUTS(dates.end)
    ]
    #
    # X axis ticks is each week (weeks + 2)
    #
    #
    weeksTotal = dates.end.diff(dates.start, 'weeks')

    ticks = ( toUTS(moment(dates.start).add(i, 'weeks')) for i in [0..weeksTotal] )

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
        tickValues: ticks
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
