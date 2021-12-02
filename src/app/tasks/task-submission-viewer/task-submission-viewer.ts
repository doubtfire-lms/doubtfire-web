
angular.module('doubtfire.tasks.task-submission-viewer', [])

//
// Viewer for an uploaded task submission
//
.directive('taskSubmissionViewer', () => ({
  restrict: 'E',
  templateUrl: 'tasks/task-submission-viewer/task-submission-viewer.tpl.html',

  scope: {
    project: '=project',
    task: '=task'
  },

  controller($scope: { notSubmitted: (task: any) => boolean; loadingDetails: (task: any) => any; $watch: (arg0: string, arg1: (newTask: any) => any) => any; taskUrl: any; taskFilesURL: any; }, TaskFeedback: { getTaskUrl: (arg0: any) => any; getTaskFilesUrl: (arg0: any) => any; }) {
    $scope.notSubmitted = (task: { has_pdf: any; processing_pdf: any; }) => !task.has_pdf && (!task.processing_pdf);

    $scope.loadingDetails = (task: { needsSubmissionDetails: () => any; }) => task.needsSubmissionDetails();

    return $scope.$watch('task', function(newTask: { getSubmissionDetails: () => void; }) {
      if (newTask == null) { return; }
      newTask.getSubmissionDetails();
      $scope.taskUrl = TaskFeedback.getTaskUrl(newTask);
      return $scope.taskFilesURL = TaskFeedback.getTaskFilesUrl(newTask);
  });
  }
}));
