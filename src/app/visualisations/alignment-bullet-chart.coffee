angular.module('doubtfire.visualisations.alignment-bullet-chart', [])
.directive 'alignmentBulletChart', ->
  replace: true
  restrict: 'E'
  templateUrl: 'visualisations/visualisation.tpl.html'
  scope:
    project: '='
    unit: '='
    ilo: '='
    targets: '='
    currentProgress: '='
    classStats: '='
    showLegend: '=?'

  controller: ($scope, gradeService, Visualisation) ->
    $scope.showLegend = if $scope.showLegend? then $scope.showLegend else true
    unless nv.models.iloBullet?
      # Chart design based on the recommendations of Stephen Few. Implementation
      # based on the work of Clint Ivy, Jamie Love, and Jason Davies.
      # http://projects.instantcognition.com/protovis/bulletchart/
      nv.models.iloBullet = ->
        chart = (selection) ->
          selection.each (d, i) ->
            availableWidth = width - (if $scope.legend then margin.left else 0) - (if $scope.legend then margin.right else 0)
            availableHeight = height - (margin.top) - (margin.bottom)
            container = d3.select(this)
            nv.utils.initSVG container
            rangez = ranges.call(this, d, i).slice().reverse()
            markerz = markers.call(this, d, i).slice().sort(d3.descending)
            measurez = measures.call(this, d, i)
            rangeLabelz = rangeLabels.call(this, d, i).slice().reverse()
            markerLabelz = markerLabels.call(this, d, i).slice()
            measureLabelz = measureLabels.call(this, d, i).slice()

            # Setup Scales
            # Compute the new x-scale.
            x1 = d3.scale.linear().domain(d3.extent(d3.merge([
              forceX
              rangez
            ]))).range(if reverse then [
              availableWidth
              0
            ] else [
              0
              availableWidth
            ])
            # Retrieve the old x-scale, if this is an update.
            x0 = @__chart__ or d3.scale.linear().domain([
              0
              Infinity
            ]).range(x1.range())

            # Stash the new scale.
            @__chart__ = x1

            # Get the range values
            rangeHD = rangez[0]
            rangeD = rangez[1]
            rangeC = rangez[2]
            rangeP = rangez[3]

            # Setup containers and skeleton of chart
            wrap = container.selectAll('g.nv-wrap.nv-bullet').data([ d ])
            wrapEnter = wrap.enter().append('g').attr('class', 'nvd3 nv-wrap nv-bullet')
            gEnter = wrapEnter.append('g')
            g = wrap.select('g')
            gEnter.append('rect').attr('class', 'nv-range nv-rangeHD').style('fill-opacity', '0.2').style('fill', gradeService.gradeColors.HD)
            gEnter.append('rect').attr('class', 'nv-range nv-rangeD' ).style('fill-opacity', '0.2').style('fill', gradeService.gradeColors.D)
            gEnter.append('rect').attr('class', 'nv-range nv-rangeC' ).style('fill-opacity', '0.2').style('fill', gradeService.gradeColors.C)
            gEnter.append('rect').attr('class', 'nv-range nv-rangeP' ).style('fill-opacity', '0.2').style('fill', gradeService.gradeColors.P)
            gEnter.append('rect').attr 'class', 'nv-measure'
            gEnter.append('rect').attr('class', 'nv-median').style('fill-opacity', '1.0').style('fill','#ffffff')
            wrap.attr 'transform', 'translate(' + margin.left + ',' + margin.top + ')'

            w0 = (d) ->
              Math.abs x0(d) - x0(0)

            w1 = (d) ->
              Math.abs x1(d) - x1(0)

            xp0 = (d) ->
              if d > 0 then x0(d) else x0(0)

            xp1 = (d) ->
              if d > 0 then x1(d) else x1(0)

            g.select('rect.nv-rangeHD')
              .attr('height', availableHeight)
              .attr('width', w1(rangeHD - rangeD) )
              .attr('x', xp1(rangeD))
              .datum rangeHD

            g.select('rect.nv-rangeD')
              .attr('height', availableHeight)
              .attr('width', w1(rangeD - rangeC))
              .attr('x', xp1(rangeC))
              .datum rangeD

            g.select('rect.nv-rangeC')
              .attr('height', availableHeight)
              .attr('width', w1(rangeC - rangeP))
              .attr('x', xp1(rangeP))
              .datum rangeC

            g.select('rect.nv-rangeP')
              .attr('height', availableHeight)
              .attr('width', w1(rangeP))
              .attr('x', xp1(0))
              .datum rangeP

            if measurez?
              g.select('rect.nv-median')
                .style('fill', "#373737")
                .style('fill-opacity',0.6)
                .attr('height', availableHeight)
                .attr('y', 0)
                .attr('width', 2)
                .attr('x', xp1(measurez.median))
                .on('mouseover', ->
                  dispatch.elementMouseover
                    value: measurez.median
                    label: 'The average student is here'
                    color: d3.select(this).style('fill')
                  return)
                .on('mousemove', ->
                  dispatch.elementMousemove
                    value: measurez.median
                    label: 'Class Median'
                    color: d3.select(this).style('fill')
                  return)
                .on 'mouseout', ->
                  dispatch.elementMouseout
                    value: measurez.median
                    label: 'Class Median'
                    color: d3.select(this).style('fill')
                  return

              g.select('rect.nv-measure')
                .style('fill', "#373737")
                .style('fill-opacity',0.6)
                .attr('height', availableHeight * 2 / 3)
                .attr('y', availableHeight / 6)
                .attr('width', xp1(measurez.upper) - xp1(measurez.lower))
                .attr('x', xp1(measurez.lower))
                .on('mouseover', ->
                  dispatch.elementMouseover
                    value: measurez[0]
                    label: measureLabelz[0] or 'Current'
                    color: d3.select(this).style('fill')
                  return)
                .on('mousemove', ->
                  dispatch.elementMousemove
                    value: measurez[0]
                    label: measureLabelz[0] or 'Current'
                    color: d3.select(this).style('fill')
                  return)
                .on 'mouseout', ->
                  dispatch.elementMouseout
                    value: measurez[0]
                    label: measureLabelz[0] or 'Current'
                    color: d3.select(this).style('fill')
                  return

            h3 = availableHeight / 6
            markerData = markerz.map((marker, index) ->
              {
                value: marker
                label: markerLabelz[index]
              }
            )
            gEnter.selectAll('path.nv-markerTriangle')
              .data(markerData)
              .enter()
              .append('path')
              .attr('class', 'nv-markerTriangle')
              .attr('d', (d,i) ->
                if i % 2 == 0
                  'M0,' + h3 + 'L' + h3 + ',' + -h3 + ' ' + -h3 + ',' + -h3 + 'Z'
                else
                  'M0,' + -h3 + 'L' + -h3 + ',0L0,' + h3 + 'L' + h3 + ',0Z'
                )
              .on('mouseover', (d) ->
                dispatch.elementMouseover(
                  value: d.value
                  label: d.label or 'Previous'
                  color: d3.select(this).style('fill')
                  pos: [
                    x1(d.value)
                    availableHeight / 2
                  ])
                return )
              .on('mousemove', (d) ->
                dispatch.elementMousemove(
                  value: d.value
                  label: d.label or 'Previous'
                  color: d3.select(this).style('fill') )
                return )
              .on 'mouseout', (d, i) ->
                dispatch.elementMouseout(
                  value: d.value
                  label: d.label or 'Previous'
                  color: d3.select(this).style('fill'))
                return

            g.selectAll('path.nv-markerTriangle')
              .data(markerData).attr 'transform', (d) ->
                'translate(' + x1(d.value) + ',' + availableHeight / 2 + ')'

            wrap.selectAll('.nv-range').on('mouseover', (d, i) ->
              label = rangeLabelz[i] or (if !i then 'Maximum' else if i == 1 then 'Mean' else 'Minimum')
              dispatch.elementMouseover
                value: d
                label: label
                color: d3.select(this).style('fill')
              return
            ).on('mousemove', ->
              dispatch.elementMousemove
                value: measurez[0]
                label: measureLabelz[0] or 'Previous'
                color: d3.select(this).style('fill')
              return
            ).on 'mouseout', (d, i) ->
              label = rangeLabelz[i] or (if !i then 'Maximum' else if i == 1 then 'Mean' else 'Minimum')
              dispatch.elementMouseout
                value: d
                label: label
                color: d3.select(this).style('fill')
              return
            return
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
        orient = 'left'
        reverse = false

        ranges = (d) ->
          d.ranges

        markers = (d) ->
          if d.markers then d.markers else []

        measures = (d) ->
          d.measures

        rangeLabels = (d) ->
          if d.rangeLabels then d.rangeLabels else []

        markerLabels = (d) ->
          if d.markerLabels then d.markerLabels else []

        measureLabels = (d) ->
          if d.measureLabels then d.measureLabels else []

        forceX = [ 0 ]
        width = 380
        height = 30
        container = null
        tickFormat = null
        color = nv.utils.getColor([ '#1f77b4' ])
        dispatch = d3.dispatch('elementMouseover', 'elementMouseout', 'elementMousemove')
        #============================================================
        # Expose Public Variables
        #------------------------------------------------------------
        chart.dispatch = dispatch
        chart.options = nv.utils.optionsFunc.bind(chart)
        chart._options = Object.create({},
          ranges:
            get: ->
              ranges
            set: (_) ->
              ranges = _
              return
          markers:
            get: ->
              markers
            set: (_) ->
              markers = _
              return
          measures:
            get: ->
              measures
            set: (_) ->
              measures = _
              return
          forceX:
            get: ->
              forceX
            set: (_) ->
              forceX = _
              return
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
          tickFormat:
            get: ->
              tickFormat
            set: (_) ->
              tickFormat = _
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
          orient:
            get: ->
              orient
            set: (_) ->
              # left, right, top, bottom
              orient = _
              reverse = orient == 'right' or orient == 'bottom'
              return
          color:
            get: ->
              color
            set: (_) ->
              color = nv.utils.getColor(_)
              return
        )
        nv.utils.initOptions chart
        chart

      # ---
      # generated by js2coffee 2.1.0


      # Chart design based on NVD3 bullet chart.
      nv.models.iloChart = ->
        #============================================================
        # Public Variables with Default Settings
        #------------------------------------------------------------

        bullet = nv.models.iloBullet()
        tooltip = nv.models.tooltip()

        # TODO: (@macite) top & bottom
        orient = 'left'
        reverse = false
        margin = if $scope.legend then { top: 5, right: 40, bottom: 5, left: 120 } else { top: 5, right: 5, bottom: 5, left: 5 }

        ranges = (d) -> d.ranges
        rangeLabels = (d) -> d.rangeLabels
        markers = (d) -> if d.markers then d.markers else []
        measures = (d) -> d.measures

        width = null
        height = 55
        tickFormat = null
        ticks = null
        noData = null
        dispatch = d3.dispatch

        tooltip
          .duration(0)
          .headerEnabled(false)

        chart = (selection) ->
          selection.each (d, i) ->
            container = d3.select(this)
            nv.utils.initSVG(container)

            availableWidth = nv.utils.availableWidth(width, container, margin)
            availableHeight = height - margin.top - margin.bottom
            that = this

            chart.update = -> chart(selection)
            chart.container = this

            # Display No Data message if there's nothing to show.
            if (!d || !ranges.call(this, d, i))
              nv.utils.noData(chart, container)
              return chart
            else
              container.selectAll('.nv-noData').remove()

            rangez = ranges.call(this, d, i).slice().sort(d3.descending)
            markerz = markers.call(this, d, i).slice().sort(d3.descending)
            measurez = measures.call(this, d, i)

            # Setup containers and skeleton of chart
            wrap = container.selectAll('g.nv-wrap.nv-bulletChart').data([d])
            wrapEnter = wrap.enter().append('g').attr('class', 'nvd3 nv-wrap nv-bulletChart')
            gEnter = wrapEnter.append('g')
            g = wrap.select('g')

            gEnter.append('g').attr('class', 'nv-bulletWrap')
            gEnter.append('g').attr('class', 'nv-titles') if $scope.legend

            wrap.attr('transform', 'translate(' + (if $scope.legend then margin.left else 10) + ',' + margin.top + ')')

            # Compute the new x-scale.
            # TODO: (@macite) need to allow forceX and forceY, and xDomain, yDomain
            x1 = d3.scale.linear()
              .domain([0, Math.max(rangez[0], (markerz[0] || 0), measurez[0])])
              .range(if reverse then [availableWidth, 0] else [0, availableWidth])

            # Retrieve the old x-scale, if this is an update.
            x0 = this.__chart__ || d3.scale.linear()
              .domain([0, Infinity])
              .range(x1.range())

            # Stash the new scale.
            this.__chart__ = x1

            # TODO: (@macite) could optimize by precalculating x0(0) and x1(0)
            w0 = (d) -> Math.abs(x0(d) - x0(0))
            w1 = (d) -> Math.abs(x1(d) - x1(0))

            if $scope.legend
              title = gEnter.select('.nv-titles').append('g')
                .attr('text-anchor', 'end')
                .attr('transform', 'translate(-6,' + (height - margin.top - margin.bottom) / 2 + ')')

              title.append('text')
                .attr('class', 'nv-title')
                .text((d) -> d.title )

              title.append('text')
                .attr('class', 'nv-subtitle')
                .attr('dy', '1em')
                .text( (d) -> d.subtitle )

            bullet
              .width(availableWidth)
              .height(availableHeight)

            bulletWrap = g.select('.nv-bulletWrap')
            d3.transition(bulletWrap).call(bullet)

            # # Compute the tick format.
            # format = tickFormat || x1.tickFormat( availableWidth / 100 )

            # # Update the tick groups.
            # tick = g.selectAll('g.nv-tick')
            #   .data x1.ticks( if ticks then ticks else (availableWidth / 50) ), (d) ->
            #     this.textContent || format(d)

            # # Initialize the ticks with the old scale, x0.
            # tickEnter = tick.enter().append('g')
            #   .attr('class', 'nv-tick')
            #   .attr('transform', (d) -> 'translate(' + x0(d) + ',0)' )
            #   .style('opacity', 1e-6)

            # tickEnter.append('line')
            #   .attr('y1', availableHeight)
            #   .attr('y2', availableHeight * 7 / 6)

            # tickEnter.append('text')
            #   .attr('text-anchor', 'middle')
            #   .attr('dy', '1em')
            #   .attr('y', availableHeight * 7 / 6)
            #   .text(format)

            # # Transition the updating ticks to the new scale, x1.
            # tickUpdate = d3.transition(tick)
            #   .attr('transform', (d) -> 'translate(' + x1(d) + ',0)')
            #   .style('opacity', 1)

            # tickUpdate.select('line')
            #   .attr('y1', availableHeight)
            #   .attr('y2', availableHeight * 7 / 6)

            # tickUpdate.select('text')
            #   .attr('y', availableHeight * 7 / 6)

            # #Transition the exiting ticks to the new scale, x1.
            # d3.transition(tick.exit())
            #   .attr('transform', (d) -> 'translate(' + x1(d) + ',0)' )
            #   .style('opacity', 1e-6 )
            #   .remove( )
          # end selection each

          d3.timer.flush()
          chart

        #============================================================
        # Event Handling/Dispatching (out of chart's scope)
        #------------------------------------------------------------
        bullet.dispatch.on 'elementMouseover.tooltip', (evt) ->
          evt['series'] = {
            key: evt.label
            # value: evt.value
            color: evt.color
          }
          tooltip.data(evt).hidden(false)

        bullet.dispatch.on 'elementMouseout.tooltip', (evt) ->
          tooltip.hidden(true)

        bullet.dispatch.on 'elementMousemove.tooltip', (evt) ->
          tooltip.position({ top: d3.event.pageY, left: d3.event.pageX })()
          tooltip()

        #============================================================
        # Expose Public Variables
        #------------------------------------------------------------

        chart.bullet = bullet
        chart.dispatch = dispatch
        chart.tooltip = tooltip

        chart.options = nv.utils.optionsFunc.bind(chart)

        chart._options = Object.create({}, {
          # simple options, just get/set the necessary values
          ranges:  {get: (-> ranges), set: ((_)-> ranges=_) }, # ranges (bad, satisfactory, good)
          rangeLabels:  {get: (-> rangeLabels), set: ((_)-> rangeLabels=_) }, # ranges (bad, satisfactory, good)
          markers:     {get: (-> markers), set: ((_) -> markers=_) }, # markers (previous, goal)
          measures: {get: (-> measures), set: ((_) -> measures=_) }, # measures (actual, forecast)
          width:    {get: (-> width), set: ((_) -> width=_) },
          height:    {get: (-> height), set: ((_) -> height=_) },
          tickFormat:    {get: (-> tickFormat), set: ((_) -> tickFormat=_) },
          ticks:    {get: (-> ticks), set: ((_) -> ticks=_) },
          noData:    {get: (-> noData), set: ((_) -> noData=_) },

          # options that require extra logic in the setter
          margin: {get: (-> margin), set: (_) ->
            margin.top    = if _.top? then _.top else margin.top
            margin.right  = if _.right? then _.right  else margin.right
            margin.bottom = if _.bottom? then _.bottom else margin.bottom
            margin.left   = if _.left? then _.left else margin.left
          },
          orient: {get: (-> orient), set: (_) -> # left, right, top, bottom
            orient = _
            reverse = orient == 'right' || orient == 'bottom'
          }
        })

        nv.utils.inheritOptions(chart, bullet)
        nv.utils.initOptions(chart)

        chart

    [$scope.options, $scope.config] = Visualisation 'iloChart', 'ILO Alignment Bullet Chart', {
      height: 60
      duration: 500
    }, {}

    targetP = $scope.targets[$scope.ilo.id][0]
    targetC = targetP + $scope.targets[$scope.ilo.id][1]
    targetD = targetC + $scope.targets[$scope.ilo.id][2]
    targetHD = targetD + $scope.targets[$scope.ilo.id][3]

    $scope.data = {
      "title": $scope.ilo.abbreviation,    #Label the bullet chart
      "subtitle": $scope.ilo.name,   #sub-label for bullet chart
      "ranges":[targetP,targetC,targetD,targetHD],  #Minimum, mean and maximum values.
      "rangeLabels":['Pass','Credit','Distinction','High Distinction'],  #Minimum, mean and maximum values.
      "measures": {},    #Value representing current measurement (the thick blue line in the example)
      "measureLabels": ['Most of the class are in this area']
      "markers":[]      #Place a marker on the chart (the white triangle marker)
      "markerLabels": ['Your Suggested Progress - Staff Suggestion', 'Your Current Progress - Self Reflection']
    }

    if $scope.classStats? && $scope.classStats.title?
      $scope.data.measureLabels[0] = $scope.classStats.title

    updateProgress = ->
      if $scope.currentProgress?
        _.each $scope.currentProgress, (d, i) ->
          $scope.data.markers[i] = $scope.currentProgress[i][$scope.ilo.id]
          if $scope.currentProgress[i].title?
            $scope.data.markerLabels[i] = $scope.currentProgress[i].title

      $scope.data.measures = if $scope.classStats? && $scope.classStats[$scope.ilo.id]? then $scope.classStats[$scope.ilo.id] else 0

    updateProgress()

    $scope.$on('ProgressUpdated', ->
      updateProgress()

      if $scope.api
        $scope.api.update()
    )
