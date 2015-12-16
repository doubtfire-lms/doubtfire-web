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
    0: '#3F92D5'
    P: '#3F92D5'
    # Credit
    1: '#3984BF'
    C: '#3984BF'
    # Distinction
    2: '#3172A5'
    D: '#3172A5'
    # High Distinction
    3: '#2A628F'
    HD: '#2A628F'
  }

  gradeService.gradeFor = (project) ->
    gradeService.grades[project.target_grade]

  gradeService
)
