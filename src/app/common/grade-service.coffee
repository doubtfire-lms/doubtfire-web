angular.module("doubtfire.grade-service", [  ])

.factory("gradeService", () ->
  #
  # The unit service object
  #
  gradeService = {}

  gradeService.grades = [
    'Pass',
    'Credit',
    'Distinction',
    'High Distinction'
  ]

  gradeService.gradeFor = (project) ->
    gradeService.grades[project.target_grade]

  gradeService
)