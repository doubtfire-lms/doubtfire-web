angular.module('doubtfire.visualisations.achievement-custom-bar-chart', [])
.directive 'achievementCustomBarChart', ->
  replace: true
  restrict: 'E'
  templateUrl: 'visualisations/visualisation.tpl.html'
  scope:
    project: '='
    unit: '='

  controller: ($scope, Visualisation, outcomeService, gradeService) ->
    $scope.showLegend = if $scope.showLegend? then $scope.showLegend else true
    unless nv.models.achievementBar?
      nv.models.achievementBar = ->
        chart = (selection) ->
          renderWatch.reset()
          selection.each (data) ->
            availableWidth = width - (margin.left) - (margin.right)
            availableHeight = height - (margin.top) - (margin.bottom)
            container = d3.select(this)
            nv.utils.initSVG container
            #add series index to each data point for reference
            data.forEach (series, i) ->
              series.values.forEach (point) ->
                point.series = i
                return
              return
            # Setup Scales
            # remap and flatten the data for use in calculating the scales' domains
            seriesData = if xDomain and yDomain then [] else data.map(((d) ->
              d.values.map ((d, i) ->
                {
                  x: getX(d, i)
                  y: getY(d, i)
                  y0: d.y0
                }
              )
            ))
            x.domain(xDomain or d3.merge(seriesData).map((d) ->
              d.x
            )).rangeBands xRange or [
              0
              availableWidth
            ], .1
            y.domain yDomain or d3.extent(d3.merge(seriesData).map((d) ->
              d.y
            ).concat(forceY))
            # If showValues, pad the Y axis range to account for label height
            if showValues
              y.range yRange or [
                availableHeight - (if y.domain()[0] < 0 then 12 else 0)
                if y.domain()[1] > 0 then 12 else 0
              ]
            else
              y.range yRange or [
                availableHeight
                0
              ]
            #store old scales if they exist
            x0 = x0 or x
            y0 = y0 or y.copy().range([
              y(0)
              y(0)
            ])
            # Setup containers and skeleton of chart
            wrap = container.selectAll('g.nv-wrap.nv-discretebar').data([ data ])
            wrapEnter = wrap.enter().append('g').attr('class', 'nvd3 nv-wrap nv-discretebar')
            gEnter = wrapEnter.append('g')
            g = wrap.select('g')
            gEnter.append('g').attr 'class', 'nv-groups'
            wrap.attr 'transform', 'translate(' + margin.left + ',' + margin.top + ')'
            # TODO: (@macite) by definition, the discrete bar should not have multiple groups, will modify/remove later
            groups = wrap.select('.nv-groups').selectAll('.nv-group').data(((d) ->
              d
            ), (d) ->
              d.key
            )
            groups.enter().append('g').style('stroke-opacity', 1e-6).style 'fill-opacity', 1e-6
            groups.exit().watchTransition(renderWatch, 'discreteBar: exit groups').style('stroke-opacity', 1e-6).style('fill-opacity', 1e-6).remove()
            groups.attr('class', (d, i) ->
              'nv-group nv-series-' + i
            )
            groups.watchTransition(renderWatch, 'discreteBar: groups').style('stroke-opacity', 1).style 'fill-opacity', .75

            if targets? && _.size(targets) > 0
              # Create the background bars... match one set per ILO
              backBarSeries = groups.selectAll('g.nv-backBarSeries').data((d) ->
                d.values
              )
              backBarSeries.exit().remove()
              backBarSeries.enter().append('g').attr('transform', (d, i) ->
                'translate(' + x(getX(d, i)) + x.rangeBand() * .05 + ', ' + y(0) + ')'
              )
              backBarSeries.attr('class', (d, i) ->
                'nv-backBarSeries nv-backSeries-' + i
              ).classed 'hover', (d) ->
                d.hover

              backBars = backBarSeries.selectAll('g.nv-backBar').data( (d,i) -> _.map(_.values(d.targets), (v) -> { value: v, key: d.label } ) )
              backBars.exit().remove()
              backBarsEnter = backBars.enter().append('g')

              backBarsEnter.append('rect').attr('height', 10).attr 'width', x.rangeBand() * .9 / data.length
              backBarsEnter.on('mouseover', (d, i) ->
                d3.select(this).classed 'hover', true
                dispatch.elementMouseover
                  data: gradeService.grades[i]
                  index: i
                  color: d.value.color
                return
              ).on('mouseout', (d, i) ->
                d3.select(this).classed 'hover', false
                dispatch.elementMouseout
                  data: gradeService.grades[i]
                  index: i
                  color: d.value.color
                return
              ).on('mousemove', (d, i) ->
                dispatch.elementMousemove
                  data: gradeService.grades[i]
                  index: i
                  color: d.value.color
                return
              ).on('click', (d, i) ->
                element = this
                dispatch.elementClick
                  data: gradeService.grades[i]
                  index: i
                  color: d.value.color
                  event: d3.event
                  element: element
                d3.event.stopPropagation()
                return
              ).on('dblclick', (d, i) ->
                dispatch.elementDblClick
                  data: gradeService.grades[i]
                  index: i
                  color: d.value.color
                d3.event.stopPropagation()
                return
              )

              backBars.attr('class', (d, i, j) ->
                if d.value.height < 0 then 'nv-backBar negative' else 'nv-backBar positive'
              ).select('rect').attr('class', rectClass).style('fill-opacity', '0.2').
                style('fill', (d) -> d.value.color).
                watchTransition(renderWatch, 'discreteBar: backBars rect').attr 'width', x.rangeBand() * .9 / data.length
              backBars.watchTransition(renderWatch, 'discreteBar: backBars').attr('transform', (d, i, j) ->
                left = x(d.key) + x.rangeBand() * .05
                top = y(d.value.height + d.value.offset)
                'translate(' + left + ', ' + top + ')'
              ).select('rect').attr 'height', (d, i, j) ->
                Math.max Math.abs(y(d.value.height) - y(0)), 1

            bars = groups.selectAll('g.nv-bar').data((d) ->
              d.values
            )
            bars.exit().remove()
            barsEnter = bars.enter().append('g').attr('transform', (d, i, j) ->
              'translate(' + x(getX(d, i)) + x.rangeBand() * .25 + ', ' + y(0) + ')'
            ).on('mouseover', (d, i) ->
              # TODO: (@macite) figure out why j works above, but not here
              d3.select(this).classed 'hover', true
              dispatch.elementMouseover
                data: d
                index: i
                color: d3.select(this).style('fill')
              return
            ).on('mouseout', (d, i) ->
              d3.select(this).classed 'hover', false
              dispatch.elementMouseout
                data: d
                index: i
                color: d3.select(this).style('fill')
              return
            ).on('mousemove', (d, i) ->
              dispatch.elementMousemove
                data: d
                index: i
                color: d3.select(this).style('fill')
              return
            ).on('click', (d, i) ->
              element = this
              dispatch.elementClick
                data: d
                index: i
                color: d3.select(this).style('fill')
                event: d3.event
                element: element
              d3.event.stopPropagation()
              return
            ).on('dblclick', (d, i) ->
              dispatch.elementDblClick
                data: d
                index: i
                color: d3.select(this).style('fill')
              d3.event.stopPropagation()
              return
            )

            barsEnter.append('rect').attr('height', 0).attr 'width', x.rangeBand() * .5 / data.length
            if showValues
              barsEnter.append('text').attr 'text-anchor', 'middle'
              bars.select('text').text((d, i) ->
                valueFormat getY(d, i)
              ).watchTransition(renderWatch, 'discreteBar: bars text').attr('x', x.rangeBand() * .5 / 2).attr 'y', (d, i) ->
                if getY(d, i) < 0 then y(getY(d, i)) - y(0) + 12 else -4
            else
              bars.selectAll('text').remove()
            bars.attr('class', (d, i) ->
              if getY(d, i) < 0 then 'nv-bar negative' else 'nv-bar positive'
            ).style('fill', (d, i) ->
              d.color or color(d, i)
            ).style('stroke', (d, i) ->
              d.color or color(d, i)
            ).select('rect').attr('class', rectClass).watchTransition(renderWatch, 'discreteBar: bars rect').attr 'width', x.rangeBand() * .5 / data.length
            bars.watchTransition(renderWatch, 'discreteBar: bars').attr('transform', (d, i) ->
              left = x(getX(d, i)) + x.rangeBand() * .25
              top = if getY(d, i) < 0 then y(0) else if y(0) - y(getY(d, i)) < 1 then y(0) - 1 else y(getY(d, i))
              'translate(' + left + ', ' + top + ')'
            ).select('rect').attr 'height', (d, i) ->
              Math.max Math.abs(y(getY(d, i)) - y(0)), 1
            #store old scales for use in transitions on update
            x0 = x.copy()
            y0 = y.copy()
            return
          renderWatch.renderEnd 'achievementBar immediate'
          chart

        'use strict'
        #============================================================
        # Public Variables with Default Settings
        #------------------------------------------------------------
        margin =
          top: 0
          right: 0
          bottom: 0
          left: 0
        width = 960
        height = 500
        id = Math.floor(Math.random() * 10000)
        container = undefined
        x = d3.scale.ordinal()
        y = d3.scale.linear()

        getX = (d) ->
          d.x

        getY = (d) ->
          d.y

        forceY = [ 0 ]
        color = nv.utils.defaultColor()
        showValues = false
        valueFormat = d3.format(',.2f')
        xDomain = undefined
        yDomain = undefined
        xRange = undefined
        yRange = undefined
        dispatch = d3.dispatch('chartClick', 'elementClick', 'elementDblClick', 'elementMouseover', 'elementMouseout', 'elementMousemove', 'renderEnd')
        rectClass = 'discreteBar'
        duration = 250
        #============================================================
        # Private Variables
        #------------------------------------------------------------
        x0 = undefined
        y0 = undefined
        renderWatch = nv.utils.renderWatch(dispatch, duration)
        #============================================================
        # Expose Public Variables
        #------------------------------------------------------------
        chart.dispatch = dispatch
        chart.options = nv.utils.optionsFunc.bind(chart)
        chart._options = Object.create({},
          width:
            get: ->
              width
            set: (_) ->
              width = _
              return
          height:
            get: ->
              height
            set: (_) ->
              height = _
              return
          forceY:
            get: ->
              forceY
            set: (_) ->
              forceY = _
              return
          showValues:
            get: ->
              showValues
            set: (_) ->
              showValues = _
              return
          x:
            get: ->
              getX
            set: (_) ->
              getX = _
              return
          y:
            get: ->
              getY
            set: (_) ->
              getY = _
              return
          xScale:
            get: ->
              x
            set: (_) ->
              x = _
              return
          yScale:
            get: ->
              y
            set: (_) ->
              y = _
              return
          xDomain:
            get: ->
              xDomain
            set: (_) ->
              xDomain = _
              return
          yDomain:
            get: ->
              yDomain
            set: (_) ->
              yDomain = _
              return
          xRange:
            get: ->
              xRange
            set: (_) ->
              xRange = _
              return
          yRange:
            get: ->
              yRange
            set: (_) ->
              yRange = _
              return
          valueFormat:
            get: ->
              valueFormat
            set: (_) ->
              valueFormat = _
              return
          id:
            get: ->
              id
            set: (_) ->
              id = _
              return
          rectClass:
            get: ->
              rectClass
            set: (_) ->
              rectClass = _
              return
          margin:
            get: ->
              margin
            set: (_) ->
              margin.top = if _.top != undefined then _.top else margin.top
              margin.right = if _.right != undefined then _.right else margin.right
              margin.bottom = if _.bottom != undefined then _.bottom else margin.bottom
              margin.left = if _.left != undefined then _.left else margin.left
              return
          color:
            get: ->
              color
            set: (_) ->
              color = nv.utils.getColor(_)
              return
          duration:
            get: ->
              duration
            set: (_) ->
              duration = _
              renderWatch.reset duration
              return
        )
        nv.utils.initOptions chart
        chart

      #
      # Chart that contains stacked bars in the background, overlaid by other bars...
      #
      nv.models.achievementBarChart = ->
        chart = (selection) ->
          renderWatch.reset()
          renderWatch.models achievementbar
          if showXAxis
            renderWatch.models xAxis
          if showYAxis
            renderWatch.models yAxis
          selection.each (data) ->
            container = d3.select(this)
            that = this
            nv.utils.initSVG container
            availableWidth = nv.utils.availableWidth(width, container, margin)
            availableHeight = nv.utils.availableHeight(height, container, margin)

            chart.update = ->
              dispatch.beforeUpdate()
              container.transition().duration(duration).call chart
              return

            chart.container = this

            # Display No Data message if there's nothing to show.
            if (!data) or (!data.length) or data.filter(((d) -> d.values.length)).length <= 0
              nv.utils.noData chart, container
              return chart
            else
              container.selectAll('.nv-noData').remove()

            # Setup Scales
            x = achievementbar.xScale()
            y = achievementbar.yScale().clamp(true)
            # Setup containers and skeleton of chart
            wrap = container.selectAll('g.nv-wrap.nv-discreteBarWithAxes').data([ data ])
            gEnter = wrap.enter().append('g').attr('class', 'nvd3 nv-wrap nv-discreteBarWithAxes').append('g')
            defsEnter = gEnter.append('defs')
            g = wrap.select('g')
            gEnter.append('g').attr 'class', 'nv-x nv-axis'
            gEnter.append('g').attr('class', 'nv-y nv-axis').append('g').attr('class', 'nv-zeroLine').append 'line'
            gEnter.append('g').attr 'class', 'nv-barsWrap'
            gEnter.append('g').attr 'class', 'nv-legendWrap'
            g.attr 'transform', 'translate(' + margin.left + ',' + margin.top + ')'
            if showLegend
              legend.width availableWidth
              g.select('.nv-legendWrap').datum(data).call legend
              if margin.top != legend.height()
                margin.top = legend.height()
                availableHeight = nv.utils.availableHeight(height, container, margin)
              wrap.select('.nv-legendWrap').attr 'transform', 'translate(0,' + -margin.top + ')'
            if rightAlignYAxis
              g.select('.nv-y.nv-axis').attr 'transform', 'translate(' + availableWidth + ',0)'
            if rightAlignYAxis
              g.select('.nv-y.nv-axis').attr 'transform', 'translate(' + availableWidth + ',0)'
            # Main Chart Component(s)
            achievementbar.width(availableWidth).height availableHeight
            barsWrap = g.select('.nv-barsWrap').datum(data.filter((d) ->
              !d.disabled
            ))
            barsWrap.transition().call achievementbar
            defsEnter.append('clipPath').attr('id', 'nv-x-label-clip-' + achievementbar.id()).append 'rect'
            g.select('#nv-x-label-clip-' + achievementbar.id() + ' rect').attr('width', x.rangeBand() * (if staggerLabels then 2 else 1)).attr('height', 16).attr 'x', -x.rangeBand() / (if staggerLabels then 1 else 2)
            # Setup Axes
            if showXAxis
              xAxis.scale(x)._ticks(nv.utils.calcTicksX(availableWidth / 100, data)).tickSize -availableHeight, 0
              g.select('.nv-x.nv-axis').attr 'transform', 'translate(0,' + (y.range()[0] + (if achievementbar.showValues() and y.domain()[0] < 0 then 16 else 0)) + ')'
              g.select('.nv-x.nv-axis').call xAxis
              xTicks = g.select('.nv-x.nv-axis').selectAll('g')
              if staggerLabels
                xTicks.selectAll('text').attr 'transform', (d, i, j) ->
                  'translate(0,' + (if j % 2 == 0 then '5' else '17') + ')'
              if rotateLabels
                xTicks.selectAll('.tick text').attr('transform', 'rotate(' + rotateLabels + ' 0,0)').style 'text-anchor', if rotateLabels > 0 then 'start' else 'end'
              if wrapLabels
                g.selectAll('.tick text').call nv.utils.wrapTicks, chart.xAxis.rangeBand()
            if showYAxis
              yAxis.scale(y)._ticks(nv.utils.calcTicksY(availableHeight / 36, data)).tickSize -availableWidth, 0
              g.select('.nv-y.nv-axis').call yAxis
            # Zero line
            g.select('.nv-zeroLine line').attr('x1', 0).attr('x2', if rightAlignYAxis then -availableWidth else availableWidth).attr('y1', y(0)).attr 'y2', y(0)
            return
          renderWatch.renderEnd 'achievementBar chart immediate'
          chart

        'use strict'
        #============================================================
        # Public Variables with Default Settings
        #------------------------------------------------------------
        achievementbar = nv.models.achievementBar()
        xAxis = nv.models.axis()
        yAxis = nv.models.axis()
        legend = nv.models.legend()
        tooltip = nv.models.tooltip()
        margin =
          top: 15
          right: 10
          bottom: 50
          left: 60
        width = null
        height = null
        color = nv.utils.getColor()
        showLegend = false
        showXAxis = true
        showYAxis = true
        rightAlignYAxis = false
        staggerLabels = false
        wrapLabels = false
        rotateLabels = 0
        x = undefined
        y = undefined
        noData = null
        dispatch = d3.dispatch('beforeUpdate', 'renderEnd')
        duration = 250
        xAxis.orient('bottom').showMaxMin(false).tickFormat (d) ->
          d
        yAxis.orient(if rightAlignYAxis then 'right' else 'left').tickFormat d3.format(',.1f')
        tooltip.duration(0).headerEnabled(false).keyFormatter (d, i) ->
          xAxis.tickFormat() d, i
        #============================================================
        # Private Variables
        #------------------------------------------------------------
        renderWatch = nv.utils.renderWatch(dispatch, duration)
        #============================================================
        # Event Handling/Dispatching (out of chart's scope)
        #------------------------------------------------------------
        achievementbar.dispatch.on 'elementMouseover.tooltip', (evt) ->
          key = chart.x()(evt.data)
          unless key?
            key = "#{evt.data} task range"
          else
            key = "Your progress with #{key}"
          evt['series'] =
            key: key
            # value: chart.y()(evt.data)
            color: evt.color
          tooltip.data(evt).hidden false
          return
        achievementbar.dispatch.on 'elementMouseout.tooltip', (evt) ->
          tooltip.hidden true
          return
        achievementbar.dispatch.on 'elementMousemove.tooltip', (evt) ->
          tooltip.position({ top: d3.event.pageY, left: d3.event.pageX })()
          tooltip()
          return
        #============================================================
        # Expose Public Variables
        #------------------------------------------------------------
        chart.dispatch = dispatch
        chart.achievementbar = achievementbar
        chart.legend = legend
        chart.xAxis = xAxis
        chart.yAxis = yAxis
        chart.tooltip = tooltip
        chart.options = nv.utils.optionsFunc.bind(chart)
        chart._options = Object.create({},
          width:
            get: ->
              width
            set: (_) ->
              width = _
              return
          height:
            get: ->
              height
            set: (_) ->
              height = _
              return
          showLegend:
            get: ->
              showLegend
            set: (_) ->
              showLegend = _
              return
          staggerLabels:
            get: ->
              staggerLabels
            set: (_) ->
              staggerLabels = _
              return
          rotateLabels:
            get: ->
              rotateLabels
            set: (_) ->
              rotateLabels = _
              return
          wrapLabels:
            get: ->
              wrapLabels
            set: (_) ->
              wrapLabels = ! !_
              return
          showXAxis:
            get: ->
              showXAxis
            set: (_) ->
              showXAxis = _
              return
          showYAxis:
            get: ->
              showYAxis
            set: (_) ->
              showYAxis = _
              return
          noData:
            get: ->
              noData
            set: (_) ->
              noData = _
              return
          margin:
            get: ->
              margin
            set: (_) ->
              margin.top = if _.top != undefined then _.top else margin.top
              margin.right = if _.right != undefined then _.right else margin.right
              margin.bottom = if _.bottom != undefined then _.bottom else margin.bottom
              margin.left = if _.left != undefined then _.left else margin.left
              return
          duration:
            get: ->
              duration
            set: (_) ->
              duration = _
              renderWatch.reset duration
              achievementbar.duration duration
              xAxis.duration duration
              yAxis.duration duration
              return
          color:
            get: ->
              color
            set: (_) ->
              color = nv.utils.getColor(_)
              achievementbar.color color
              legend.color color
              return
          rightAlignYAxis:
            get: ->
              rightAlignYAxis
            set: (_) ->
              rightAlignYAxis = _
              yAxis.orient if _ then 'right' else 'left'
              return
        )
        nv.utils.inheritOptions chart, achievementbar
        nv.utils.initOptions chart
        chart


    #
    # Get the data and options for the chart...
    #
    targets = outcomeService.calculateTargets($scope.unit, $scope.unit, outcomeService.unitTaskStatusFactor())
    currentProgress = outcomeService.calculateProgress($scope.unit, $scope.project)

    achievementData = {
      key: "Learning Achievement"
      values: []
    }

    max = 0

    _.each $scope.unit.ilos, (ilo) ->
      iloTargets = { }
      iloTargets[0] = { offset: 0, height: targets[ilo.id][0], color: gradeService.gradeColors.P }
      iloTargets[1] = { offset: iloTargets[0].offset + iloTargets[0].height, height: targets[ilo.id][1], color: gradeService.gradeColors.C  }
      iloTargets[2] = { offset: iloTargets[1].offset + iloTargets[1].height, height: targets[ilo.id][2], color: gradeService.gradeColors.D  }
      iloTargets[3] = { offset: iloTargets[2].offset + iloTargets[2].height, height: targets[ilo.id][3], color: gradeService.gradeColors.HD }

      if iloTargets[3].offset + iloTargets[3].height  > max
        max = iloTargets[3].offset + iloTargets[3].height

      achievementData.values.push {
        label: ilo.name
        value: currentProgress[0][ilo.id] # 0 = staff value
        targets: iloTargets
      }

    [$scope.options, $scope.config] = Visualisation 'achievementBarChart', 'ILO Achievement Bar Chart', {
      height: 600
      duration: 500
      yDomain: [0, max]
      showValues: false
      showYAxis: false
      showLegend: false
      x: (d) -> d.label
      y: (d) -> d.value
      color: (d) -> '#373737'
    }, {}

    $scope.data = [ achievementData ]
