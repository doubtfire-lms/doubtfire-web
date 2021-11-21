angular.module('doubtfire.visualisations.summary-task-status-scatter', [])
.directive('summaryTaskStatusScatter', () => ({
  replace: true,
  restrict: 'E',
  templateUrl: 'visualisations/visualisation.tpl.html',

  scope: {
    data: '=',
    unit: '='
  },

  controller($scope: { unit: { task_definitions: { [x: string]: { abbreviation: any; }; }; }; options: any; config: any; }, taskService: { statusAcronym: { [x: string]: any; }; statusKeys: { [x: string]: string | number; }; }, Visualisation: (arg0: string, arg1: string, arg2: { xAxis: { axisLabel: string; tickFormat: (value: any) => any; }; yAxis: { axisLabel: string; tickFormat: (value: any) => any; }; showDistX: boolean; showDistY: boolean; }, arg3: {}) => any) {
    let ref: any;
    const yAxisTickFormatFunction = function(value: string | number) {
      if ($scope.unit.task_definitions[value]) {
        return $scope.unit.task_definitions[value].abbreviation;
      } else {
        return '';
      }
    };

    const xAxisTickFormatFunction = function(value: any) {
      const idx = Math.floor(value);
      return taskService.statusAcronym[taskService.statusKeys[idx]];
    };

    return [$scope.options, $scope.config] = Array.from(ref = Visualisation('scatterChart', 'Task Status Summary Scatter Chart', {
      xAxis: {
        axisLabel: 'Statuses',
        tickFormat: xAxisTickFormatFunction
      },
      yAxis: {
        axisLabel: 'Task',
        tickFormat: yAxisTickFormatFunction
      },
      showDistX: true,
      showDistY: true
    }, {})), ref;
  }
}));
