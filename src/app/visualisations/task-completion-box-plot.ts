angular.module('doubtfire.visualisations.task-completion-box-plot', [])
.directive('taskCompletionBoxPlot', () => ({
  replace: true,
  restrict: 'E',
  templateUrl: 'visualisations/visualisation.tpl.html',

  scope: {
    rawData: '=data',
    unit: '=',
    type: '=',
    height: '=?',
    showLegend: '=?'
  },

  controller($scope: { showLegend: any; height: any; type: string; data: {}; api: { refresh: () => any; }; $watch: (arg0: string, arg1: (newData: any) => any) => void; rawData: any; options: any; config: any; unit: { task_definitions: { length: number; }; }; }, $filter: (arg0: string) => { (arg0: any): any; new(): any; }, $timeout: (arg0: () => any) => any, gradeService: { grades: { [x: string]: any; }; }, Visualisation: (arg0: string, arg1: string, arg2: {
          x(d: any): any; height: any; showXAxis: any; margin: { top: number; right: number; bottom: number; left: number; }; yAxis: { axisLabel: string; }; tooltip: { enabled: any; }; maxBoxWidth: number; yDomain: {}; //round to nearest 2
      }, arg3: {}) => any) {
    let ref: any;
    $scope.showLegend = ($scope.showLegend == null) ? true : $scope.showLegend;
    $scope.height     = ($scope.height == null)     ? 600  : $scope.height;

    const refreshData = function(newData: { lower: any; median: any; upper: any; min: any; max: any; }) {
      if ($scope.type !== 'grade') {
        $scope.data = [
          {
            label: $filter('ucfirst')($scope.type),
            values: {
              Q1: newData.lower,
              Q2: newData.median,
              Q3: newData.upper,
              whisker_low: newData.min,
              whisker_high: newData.max
            }
          }
        ];
      } else {
        $scope.data = _.map(newData, function(d: { lower: any; median: any; upper: any; min: any; max: any; }, id: string | number) {
          const label = gradeService.grades[id];
          return {
            label,
            values: {
              Q1: d.lower,
              Q2: d.median,
              Q3: d.upper,
              whisker_low: d.min,
              whisker_high: d.max
            }
          };
      });
      }

      return $timeout(function() {
        if (($scope.api != null ? $scope.api.refresh : undefined) != null) {
          return $scope.api.refresh();
        }
      });
    };

    $scope.$watch('rawData', refreshData);
    refreshData($scope.rawData);

    return [$scope.options, $scope.config] = Array.from(ref = Visualisation('boxPlotChart', 'Task Completion Summary Box Plot', {
      x(d: { label: any; }) { return d.label; },
      height: $scope.height,
      showXAxis: $scope.showLegend,
      margin: {
        top:    $scope.showLegend ? 20 : 20,
        right:  $scope.showLegend ? 10 : 10,
        bottom: $scope.showLegend ? 60 : 20,
        left:   $scope.showLegend ? 80 : 40
      },
      yAxis: {
        axisLabel: $scope.showLegend ? "Number of tasks completed" : undefined
      },
      tooltip: {
        enabled: $scope.showLegend
      },
      maxBoxWidth: 75,
      yDomain: [0, Math.ceil($scope.unit.task_definitions.length/2) * 2] //round to nearest 2
    }, {})), ref;
  }
}));
