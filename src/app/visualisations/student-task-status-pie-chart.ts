angular.module('doubtfire.visualisations.student-task-status-pie-chart', [])
.directive('studentTaskStatusPieChart', () => ({
  replace: true,
  restrict: 'E',
  templateUrl: 'visualisations/visualisation.tpl.html',

  scope: {
    project: '=',
    updateData: '=?'
  },

  controller($scope: { data: { length?: any; push?: any; }; updateData: { (): void; (): any; }; project: { target_tasks: () => { (): any; new(): any; length: number; }; }; api: { update: () => any; }; $on: (arg0: string, arg1: any) => void; options: any; config: any; }, taskService: { statusColors: any; statusLabels: any; }, projectService: { tasksByStatus: (arg0: any, arg1: any) => { (): any; new(): any; length: any; }; }, Visualisation: (arg0: string, arg1: string, arg2: { color(d: any, i: any): any; x(d: any): any; y(d: any): any; showLabels: boolean; tooltip: { valueFormatter(d: any): string; keyFormatter(d: any): any; }; }, arg3: {}) => any) {
    let ref: any;
    const colors = taskService.statusColors;
    $scope.data = [];

    $scope.updateData = function() {
      $scope.data.length = 0;
      _.each(taskService.statusLabels, function(label: any, key: any) {
        const count = projectService.tasksByStatus($scope.project, key).length;
        return $scope.data.push({ key: label, y: count, status_key: key });
    });

      if ($scope.api) {
        return $scope.api.update();
      }
    };

    $scope.$on('TaskStatusUpdated', $scope.updateData);

    $scope.updateData();

    return [$scope.options, $scope.config] = Array.from(ref = Visualisation('pieChart', 'Student Task Status Pie Chart', {
      color(d: { status_key: string | number; }, i: any) {
        return colors[d.status_key];
      },
      x(d: { key: any; }) { return d.key; },
      y(d: { y: any; }) { return d.y; },
      showLabels: false,
      tooltip: {
        valueFormatter(d: number) {
          const fixed = d.toFixed();
          const pct   = Math.round((d / $scope.project.target_tasks().length) * 100);
          const task  = fixed === "1" ? "task" : "tasks";
          return `${fixed} ${task} (${pct}%)`;
        },
        keyFormatter(d: any) {
          return d;
        }
      }
    }, {})), ref;
  }
}));
