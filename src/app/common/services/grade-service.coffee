angular.module("doubtfire.services.grades", [  ])

.factory("gradeService", () ->
  #
  # The unit service object
  #
  gradeService = {}

  gradeService.gradeValues = [0..3]

  gradeService.grades = [
    'Pass',
    'Credit',
    'Distinction',
    'High Distinction'
  ]

  gradeService.gradeNumbers =
    P:  0
    C:  1
    D:  2
    HD: 3

  gradeService.gradeAcronyms =
    'Pass': 'P'
    'Credit': 'C'
    'Distinction': 'D'
    'High Distinction': 'HD'

  gradeService.gradeColors = {
    # Pass
    0: '#FF0000'
    P: '#FF0000'
    # Credit
    1: '#FF8000'
    C: '#FF8000'
    # Distinction
    2: '#0080FF'
    D: '#0080FF'
    # High Distinction
    3: '#80FF00'
    HD: '#80FF00'
  }

  gradeService.gradeFor = (project) ->
    gradeService.grades[project.target_grade]

  gradeService
)
