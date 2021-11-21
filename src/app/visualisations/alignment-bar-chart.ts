angular.module('doubtfire.visualisations.alignment-bar-chart', [])
.directive('alignmentBarChart', () => ({
  replace: true,
  restrict: 'E',
  templateUrl: 'visualisations/visualisation.tpl.html',

  scope: {
    project: '=',
    unit: '=',
    source: '=',
    taskStatusFactor: '='
  },

  controller($scope: { options?: any; config?: any; data?: any; calculateAlignmentVisualisation?: any; unit: any; api?: any; source?: any; taskStatusFactor?: any; $on?: any; }, Visualisation: (arg0: string, arg1: string, arg2: { clipEdge: boolean; stacked: boolean; height: number; duration: number; color(d: any): any; x: (d: any) => any; y: (d: any) => any; forceY: number; showYAxis: boolean; }, arg3: {}) => any, projectService: any, gradeService: { gradeColors: { [x: string]: any; }; gradeAcronyms: { [x: string]: string | number; }; }, taskService: any, outcomeService: { targetsByGrade: (arg0: any, arg1: any) => any; }) {
    const xFn = (d: { label: any; }) => d.label;
    const yFn = (d: { value: any; }) => d.value;

    [$scope.options, $scope.config] = Array.from(Visualisation('multiBarChart', 'ILO Alignment Bar Chart', {
      clipEdge: true,
      stacked: false,
      height: 200,
      duration: 500,
      color(d: { key: string | number; }) {
        return gradeService.gradeColors[gradeService.gradeAcronyms[d.key]];
      },
      x: xFn,
      y: yFn,
      forceY: 0,
      showYAxis: false
    }, {}));

    $scope.data = [];

    $scope.calculateAlignmentVisualisation = function(source: any, taskStatusFactor: any) {
      const {
        unit
      } = $scope;
      _.extend($scope.data, outcomeService.targetsByGrade($scope.unit, source));

      if ($scope.api != null) {
        return $scope.api.update();
      }
    };

    $scope.calculateAlignmentVisualisation($scope.source, $scope.taskStatusFactor);

    return $scope.$on('UpdateAlignmentChart', () => $scope.calculateAlignmentVisualisation($scope.source, $scope.taskStatusFactor));
  }
}));
