angular
  .module('doubtfire.tasks.task-ilo-alignment.task-ilo-alignment-editor', [])

  .directive('taskIloAlignmentEditor', () => ({
    replace: true,
    restrict: 'E',
    templateUrl: 'tasks/task-ilo-alignment/task-ilo-alignment-editor/task-ilo-alignment-editor.tpl.html',

    scope: {
      unit: '=',
      project: '=?',
      showCsv: '=',
      hidePanel: '=?',
      // select tasks to include in portfolio
      showIncludeTasks: '=?',
    },

    controller(
      $scope: {
        showTaskName: boolean;
        unit: { ilos: { length: number }; task_definitions: any; refresh: () => any };
        showGraph: boolean;
        closeGraph: () => boolean;
        project: { tasks: any; project_id: any; refresh: (arg0: any) => any };
        source: { task_outcome_alignments: any };
        tasks: any;
        taskStatusFactor: any;
        $watch: (arg0: string, arg1: () => {}) => void;
        showAlignmentModal: (task: any, ilo: any, alignment: any) => any;
        alignmentForTaskAndIlo: (task: any, ilo: any) => any;
        disableInclude: (task: any) => boolean;
        includeTaskInPorfolio: (task: any) => any;
        csvImportResponse: {};
        taskAlignmentCSV: { file: { name: string; type: string } };
        taskAlignmentCSVUploadUrl: () => any;
        isTaskCSVUploading: any;
        onTaskAlignmentCSVSuccess: (response: any) => any;
        onTaskAlignmentCSVComplete: () => any;
        downloadTaskAlignmentCSV: () => any;
      },
      $modal: any,
      $rootScope: { $broadcast: (arg0: string, arg1: any, arg2: { batch: boolean }) => void },
      $filter: any,
      currentUser: any,
      unitService: any,
      alertService: any,
      gradeService: any,
      LearningAlignments: any,
      projectService: any,
      taskService: any,
      Visualisation: any,
      TaskAlignment: {
        taskAlignmentCSVUploadUrl: (arg0: any, arg1: any) => any;
        downloadCSV: (arg0: any, arg1: any) => any;
      },
      Task: {
        update: (
          arg0: { project_id: any; task_definition_id: any; include_in_portfolio: any },
          arg1: (success: any) => any
        ) => any;
      },
      CsvResultModal: { show: (arg0: string, arg1: any) => void },
      outcomeService: { projectTaskStatusFactor: (arg0: any) => any; unitTaskStatusFactor: () => any },
      TaskILOAlignmentModal: { show: (arg0: any, arg1: any, arg2: any, arg3: any, arg4: any, arg5: any) => any }
    ) {
      $scope.showTaskName = $scope.unit.ilos.length < 5;
      $scope.showGraph = false;
      $scope.closeGraph = () => ($scope.showGraph = false);
      // Set source
      if ($scope.project != null) {
        $scope.source = $scope.project;
        $scope.tasks = $scope.project.tasks;
        $scope.taskStatusFactor = outcomeService.projectTaskStatusFactor($scope.project);
      } else {
        $scope.source = $scope.unit;
        $scope.tasks = _.map($scope.unit.task_definitions, (td: any) => ({
          definition: td,
        }));
        $scope.taskStatusFactor = outcomeService.unitTaskStatusFactor();
      }

      let alignments = [];
      $scope.$watch('source.task_outcome_alignments.length', function () {
        if ($scope.source.task_outcome_alignments == null) {
          return;
        }
        alignments = _.chain($scope.source.task_outcome_alignments)
          .filter((d: { rating: number }) => d.rating > 0)
          .groupBy('task_definition_id')
          .map(function (d: any, i: any) {
            d = _.chain(d)
              .groupBy('learning_outcome_id')
              .map((d: {}, i: any) => [i, d[0]])
              .fromPairs()
              .value();
            return [i, d];
          })
          .fromPairs()
          .value();
        return alignments;
      });

      $scope.showAlignmentModal = (task: any, ilo: any, alignment: any) =>
        TaskILOAlignmentModal.show(task, ilo, alignment, $scope.unit, $scope.project, $scope.source);

      $scope.alignmentForTaskAndIlo = (task: { definition: { id: string | number } }, ilo: { id: string | number }) =>
        alignments[task.definition.id] != null ? alignments[task.definition.id][ilo.id] : undefined;

      $scope.disableInclude = function (task: { definition: { id: string | number } }) {
        // if there are no ILOs, you can always include tasks
        if ($scope.unit.ilos.length > 0) {
          return alignments[task.definition.id] === undefined;
        } else {
          return false;
        }
      };

      $scope.includeTaskInPorfolio = function (task: { include_in_portfolio: boolean; definition: { id: any } }) {
        task.include_in_portfolio = !task.include_in_portfolio;
        return Task.update(
          {
            project_id: $scope.project.project_id,
            task_definition_id: task.definition.id,
            include_in_portfolio: task.include_in_portfolio,
          },
          (success: { include_in_portfolio: any }) => (task.include_in_portfolio = success.include_in_portfolio)
        );
      };

      // CSV stuff
      $scope.csvImportResponse = {};
      $scope.taskAlignmentCSV = { file: { name: 'Task Outcome Link CSV', type: 'csv' } };
      $scope.taskAlignmentCSVUploadUrl = function () {
        if ($scope.project != null) {
          return TaskAlignment.taskAlignmentCSVUploadUrl($scope.unit, $scope.project.project_id);
        } else {
          return TaskAlignment.taskAlignmentCSVUploadUrl($scope.unit, null);
        }
      };
      $scope.isTaskCSVUploading = null;
      $scope.onTaskAlignmentCSVSuccess = function (response: any) {
        CsvResultModal.show('Task CSV upload results.', response);
        $rootScope.$broadcast('UpdateAlignmentChart', response, { batch: true });
        if ($scope.project != null) {
          return $scope.project.refresh($scope.unit);
        } else {
          angular
            .module('doubtfire.tasks.task-ilo-alignment.task-ilo-alignment-editor', [])

            .directive('taskIloAlignmentEditor', () => ({
              replace: true,
              restrict: 'E',
              templateUrl: 'tasks/task-ilo-alignment/task-ilo-alignment-editor/task-ilo-alignment-editor.tpl.html',

              scope: {
                unit: '=',
                project: '=?',
                showCsv: '=',
                hidePanel: '=?',
                // select tasks to include in portfolio
                showIncludeTasks: '=?',
              },

              controller(
                $scope: {
                  showTaskName: boolean;
                  unit: { ilos: { length: number }; task_definitions: any; refresh: () => any };
                  showGraph: boolean;
                  closeGraph: () => boolean;
                  project: { tasks: any; project_id: any; refresh: (arg0: any) => any };
                  source: { task_outcome_alignments: any };
                  tasks: any;
                  taskStatusFactor: any;
                  $watch: (arg0: string, arg1: () => {}) => void;
                  showAlignmentModal: (task: any, ilo: any, alignment: any) => any;
                  alignmentForTaskAndIlo: (task: any, ilo: any) => any;
                  disableInclude: (task: any) => boolean;
                  includeTaskInPorfolio: (task: any) => any;
                  csvImportResponse: {};
                  taskAlignmentCSV: { file: { name: string; type: string } };
                  taskAlignmentCSVUploadUrl: () => any;
                  isTaskCSVUploading: any;
                  onTaskAlignmentCSVSuccess: (response: any) => any;
                  onTaskAlignmentCSVComplete: () => any;
                  downloadTaskAlignmentCSV: () => any;
                },
                $modal: any,
                $rootScope: { $broadcast: (arg0: string, arg1: any, arg2: { batch: boolean }) => void },
                $filter: any,
                currentUser: any,
                unitService: any,
                alertService: any,
                gradeService: any,
                LearningAlignments: any,
                projectService: any,
                taskService: any,
                Visualisation: any,
                TaskAlignment: {
                  taskAlignmentCSVUploadUrl: (arg0: any, arg1: any) => any;
                  downloadCSV: (arg0: any, arg1: any) => any;
                },
                Task: {
                  update: (
                    arg0: { project_id: any; task_definition_id: any; include_in_portfolio: any },
                    arg1: (success: any) => any
                  ) => any;
                },
                CsvResultModal: { show: (arg0: string, arg1: any) => void },
                outcomeService: { projectTaskStatusFactor: (arg0: any) => any; unitTaskStatusFactor: () => any },
                TaskILOAlignmentModal: {
                  show: (arg0: any, arg1: any, arg2: any, arg3: any, arg4: any, arg5: any) => any;
                }
              ) {
                $scope.showTaskName = $scope.unit.ilos.length < 5;
                $scope.showGraph = false;
                $scope.closeGraph = () => ($scope.showGraph = false);
                // Set source
                if ($scope.project != null) {
                  $scope.source = $scope.project;
                  $scope.tasks = $scope.project.tasks;
                  $scope.taskStatusFactor = outcomeService.projectTaskStatusFactor($scope.project);
                } else {
                  $scope.source = $scope.unit;
                  $scope.tasks = _.map($scope.unit.task_definitions, (td: any) => ({
                    definition: td,
                  }));
                  $scope.taskStatusFactor = outcomeService.unitTaskStatusFactor();
                }

                let alignments = [];
                $scope.$watch('source.task_outcome_alignments.length', function () {
                  if ($scope.source.task_outcome_alignments == null) {
                    return;
                  }
                  alignments = _.chain($scope.source.task_outcome_alignments)
                    .filter((d: { rating: number }) => d.rating > 0)
                    .groupBy('task_definition_id')
                    .map(function (d: any, i: any) {
                      d = _.chain(d)
                        .groupBy('learning_outcome_id')
                        .map((d: {}, i: any) => [i, d[0]])
                        .fromPairs()
                        .value();
                      return [i, d];
                    })
                    .fromPairs()
                    .value();
                  return alignments;
                });

                $scope.showAlignmentModal = (task: any, ilo: any, alignment: any) =>
                  TaskILOAlignmentModal.show(task, ilo, alignment, $scope.unit, $scope.project, $scope.source);

                $scope.alignmentForTaskAndIlo = (
                  task: { definition: { id: string | number } },
                  ilo: { id: string | number }
                ) => (alignments[task.definition.id] != null ? alignments[task.definition.id][ilo.id] : undefined);

                $scope.disableInclude = function (task: { definition: { id: string | number } }) {
                  // if there are no ILOs, you can always include tasks
                  if ($scope.unit.ilos.length > 0) {
                    return alignments[task.definition.id] === undefined;
                  } else {
                    return false;
                  }
                };

                $scope.includeTaskInPorfolio = function (task: {
                  include_in_portfolio: boolean;
                  definition: { id: any };
                }) {
                  task.include_in_portfolio = !task.include_in_portfolio;
                  return Task.update(
                    {
                      project_id: $scope.project.project_id,
                      task_definition_id: task.definition.id,
                      include_in_portfolio: task.include_in_portfolio,
                    },
                    (success: { include_in_portfolio: any }) =>
                      (task.include_in_portfolio = success.include_in_portfolio)
                  );
                };

                // CSV stuff
                $scope.csvImportResponse = {};
                $scope.taskAlignmentCSV = { file: { name: 'Task Outcome Link CSV', type: 'csv' } };
                $scope.taskAlignmentCSVUploadUrl = function () {
                  if ($scope.project != null) {
                    return TaskAlignment.taskAlignmentCSVUploadUrl($scope.unit, $scope.project.project_id);
                  } else {
                    return TaskAlignment.taskAlignmentCSVUploadUrl($scope.unit, null);
                  }
                };
                $scope.isTaskCSVUploading = null;
                $scope.onTaskAlignmentCSVSuccess = function (response: any) {
                  CsvResultModal.show('Task CSV upload results.', response);
                  $rootScope.$broadcast('UpdateAlignmentChart', response, { batch: true });
                  if ($scope.project != null) {
                    return $scope.project.refresh($scope.unit);
                  } else {
                    return $scope.unit.refresh();
                  }
                };
                $scope.onTaskAlignmentCSVComplete = () => ($scope.isTaskCSVUploading = null);

                return ($scope.downloadTaskAlignmentCSV = function () {
                  if ($scope.project != null) {
                    return TaskAlignment.downloadCSV($scope.unit, $scope.project.project_id);
                  } else {
                    return TaskAlignment.downloadCSV($scope.unit, null);
                  }
                });
              },
            }));
          return $scope.unit.refresh();
        }
      };
      $scope.onTaskAlignmentCSVComplete = () => ($scope.isTaskCSVUploading = null);

      return ($scope.downloadTaskAlignmentCSV = function () {
        if ($scope.project != null) {
          return TaskAlignment.downloadCSV($scope.unit, $scope.project.project_id);
        } else {
          return TaskAlignment.downloadCSV($scope.unit, null);
        }
      });
    },
  }));
