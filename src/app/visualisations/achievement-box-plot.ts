angular.module('doubtfire.visualisations.achievement-box-plot', [])
.directive('achievementBoxPlot', () => ({
  replace: true,
  restrict: 'E',
  templateUrl: 'visualisations/visualisation.tpl.html',

  scope: {
    rawData: '=data',
    type: '=',
    unit: '=',
    pctHolder: '=',
    height: '=?',
    showLegend: '=?'
  },

  controller($scope: { showLegend: any; height: any; unit: { ilos: any; }; pctHolder: { pct: any; }; options: { chart: { yDomain: {}; }; }; data: any; api: { refresh: () => any; }; config: any; $watch: (arg0: string, arg1: (newData: any, oldData: any) => any) => void; rawData: any; }, $timeout: (arg0: () => any) => any, Visualisation: (arg0: string, arg1: string, arg2: { x(d: any): any; height: any; showXAxis: any; margin: { top: number; right: number; bottom: number; left: number; }; yAxis: { axisLabel: string; }; tooltip: { enabled: any; }; maxBoxWidth: number; yDomain: {}; }, arg3: {}, arg4: string) => any, outcomeService: { calculateTargets: (arg0: any, arg1: any, arg2: any) => any; unitTaskStatusFactor: () => any; }) {
    $scope.showLegend = ($scope.showLegend == null) ? true : $scope.showLegend;
    $scope.height     = ($scope.height == null)     ? 600  : $scope.height;

    const iloValues = outcomeService.calculateTargets($scope.unit, $scope.unit, outcomeService.unitTaskStatusFactor());
    const iloMaxes = _.mapValues(iloValues, (d: any, k: any) => _.reduce(d, ((memo: any, value: any) => memo + value), 0));
    const rangeMax = _.max(_.values(iloMaxes));

    const refreshData = function(newData: any) {
      const isPct = (($scope.pctHolder != null) && $scope.pctHolder.pct);
      if (isPct) {
        $scope.options.chart.yDomain = [0, 1];
      } else {
        $scope.options.chart.yDomain = [0, rangeMax];
      }

      $scope.data = _.map(newData, function(d: { lower: number; median: number; upper: number; min: number; max: number; }, id: string | number) {
        let max = iloMaxes[id];
        if (((max == null)) || (max === 0) || !isPct) {
          max = 1;
        }
        const label = _.find($scope.unit.ilos, { id: +id }).abbreviation;
        return {
          label,
          values: {
            Q1: d.lower / max,
            Q2: d.median / max,
            Q3: d.upper / max,
            whisker_low: d.min / max,
            whisker_high: d.max / max
          }
        };
    });
      return $timeout(function() {
        if (($scope.api != null ? $scope.api.refresh : undefined) != null) {
          return $scope.api.refresh();
        }
      });
    };

    [$scope.options, $scope.config] = Array.from(Visualisation('boxPlotChart', 'ILO Achievement Box Plot', {
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
        axisLabel: $scope.showLegend ? "ILO Achievement" : undefined
      },
      tooltip: {
        enabled: $scope.showLegend
      },
      maxBoxWidth: 75,
      yDomain: [0, 1]
    }, {}, 'Achievement Box Plot'));

    // $scope.$watch 'rawData', refreshData($scope.rawData)
    $scope.$watch('pctHolder.pct', function(newData: any, oldData: any) { if (newData !== oldData) { return refreshData($scope.rawData); } });

    return refreshData($scope.rawData);
  }
}));
