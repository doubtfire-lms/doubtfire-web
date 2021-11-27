angular.module('doubtfire.visualisations.progress-burndown-chart', [])
.directive('progressBurndownChart', () => ({
  restrict: 'E',
  templateUrl: 'visualisations/visualisation.tpl.html',

  scope: {
    project: '=',
    unit: '='
  },

  controller($scope: { data: { length?: any; }; $watch: (arg0: string, arg1: (newValue: any) => any) => any; api: { refresh: () => void; }; unit: { start_date: any; end_date: any; }; options: any; config: any; }, Visualisation: (arg0: string, arg1: string, arg2: { useInteractiveGuideline: boolean; interactiveLayer: { tooltip: { contentGenerator(data: any): string; }; }; height: number; margin: { left: number; right: number; }; xAxis: { axisLabel: string; tickFormat: (d: any) => any; ticks: number; }; yAxis: { axisLabel: string; tickFormat: (d: any) => any; }; color: (d: any, i: any) => "#AAAAAA" | "#777777" | "#0079d8" | "#E01B5D"; legendColor: (d: any, i: any) => "#AAAAAA" | "#777777" | "#0079d8" | "#E01B5D"; x: (d: any) => any; y: (d: any) => any; yDomain: {}; xDomain: {}; }, arg3: {}) => any, listenerService: { listenTo: (arg0: any) => any; }) {
    let ref: any;
    const listeners = listenerService.listenTo($scope);

    $scope.data = [];

    listeners.push($scope.$watch('project.burndown_chart_data', function(newValue: { push: (arg0: { key: string; values: {}; color: string; classed: string; }) => void; }) {
      if (newValue == null) { return; }
      const now = +new Date().getTime() / 1000;
      const timeSeries = {
        key: "NOW",
        values: [
          [now, 0],
          [now, 1]
        ],
        color: '#CACACA',
        classed: 'dashed'
      };
      if (!_.find(newValue, {key: 'NOW'})) { newValue.push(timeSeries); }
      $scope.data.length = 0;
      _.extend($scope.data, newValue);
      if ($scope.api != null) {
        $scope.api.refresh();
      }
      return null;
    })
    );

    const xAxisTickFormatDateFormat = (d: number) => d3.time.format('%b %d')(new Date(d * 1000));

    const yAxisTickFormatPercentFormat = (d: any) => d3.format(',%')(d);

    const colorFunction = function(d: any, i: number) {
      if (i === 0) { //projeted
        return '#AAAAAA';
      } else if (i === 1) { //target
        return '#777777';
      } else if (i === 2) { //done
        return '#0079d8';
      } else { //sign off
        return '#E01B5D';
      }
    };

    //
    // No need to clip x axis
    //
    const xAxisClipNegBurndown = (d: {}) => d[0];

    //
    // Clips y to 0 if y < 0
    //
    const yAxisClipNegBurndown = function(d: {}) {
      if (d[1] < 0.0) { return 0; } else { return d[1]; }
    };

    //
    // Graph unit dates as moment.js dates
    //
    const dates = {
      start: moment($scope.unit.start_date),
      // represent the graph as 2 weeks after the unit's end date
      end:   moment($scope.unit.end_date).add(2, 'weeks')
    };

    //
    // Converts a moment date to a Unix Time Stamp in seconds
    //
    const toUnixTimestamp = (momentDate: string | number) => +momentDate / 1000;

    //
    // X domain is defined as the unit's start date to the unit's end date add two weeks
    //
    const xDomain = [
      toUnixTimestamp(dates.start),
      toUnixTimestamp(dates.end)
    ];

    return [$scope.options, $scope.config] = Array.from(ref = Visualisation('lineChart', 'Student Progress Burndown Chart', {
      useInteractiveGuideline: true,
      interactiveLayer: {
        tooltip: {
          contentGenerator(data: { value?: any; series?: any; }) {
            // Need to generate this so as to not include NOW key
            const date = data.value;
            const {
              series
            } = data;
            let html = `<table class='col-sm-6'><thead><tr><td colspan='3'><strong class='x-value'>${date}</strong></td></tr></thead><tbody>`;
            html += (Array.from(series).filter((d: { key: string; }) => d.key !== 'NOW').map((d: { color: any; key: any; value: any; }) => `<tr><td class='legend-color-guide'><div style='background-color: ${d.color};'></div></td><td class='key'>${d.key}</td><td class='value'>${d3.format(',%')(d.value)}</td></tr><tr>`)).join('');
            html += "</tbody></table>";
            return html;
          }
        }
      },
      height: 440,
      margin: {
        left: 75,
        right: 50
      },
      xAxis: {
        axisLabel: "Time",
        tickFormat: xAxisTickFormatDateFormat,
        ticks: 8
      },
      yAxis: {
        axisLabel: "Tasks Remaining",
        tickFormat: yAxisTickFormatPercentFormat
      },
      color: colorFunction,
      legendColor: colorFunction,
      x: xAxisClipNegBurndown,
      y: yAxisClipNegBurndown,
      yDomain: [0, 1],
      xDomain
    }, {})), ref;
  }
}));
