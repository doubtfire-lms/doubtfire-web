angular.module("doubtfire.services.grades", [  ])

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

  gradeService.gradeAcronyms =
    'Pass': 'P'
    'Credit': 'C'
    'Distinction': 'D'
    'High Distinction': 'HD'

  gradeService.gradeFor = (project) ->
    gradeService.grades[project.target_grade]

  gradeService
)