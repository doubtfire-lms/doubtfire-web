angular.module("doubtfire.common.services.grades", [  ])
#
# Service for grade-related data
#
.factory("gradeService", ->
  #
  # The unit service object
  #
  gradeService = {}

  # All grades - except fail...
  gradeService.gradeValues = [0..3]

  gradeService.allGradeValues = [-1..3]

  gradeService.grades = [
    'Pass',
    'Credit',
    'Distinction',
    'High Distinction'
  ]

  gradeService.grades[-1] = 'Fail'

  gradeService.gradeNumbers =
    F: -1
    P:  0
    C:  1
    D:  2
    HD: 3

  gradeService.gradeAcronyms =
    'Fail': 'F'
    'Pass': 'P'
    'Credit': 'C'
    'Distinction': 'D'
    'High Distinction': 'HD'
    # -1: 'F'
    0: 'P'
    1: 'C'
    2: 'D'
    3: 'HD'

  gradeService.gradeAcronyms[-1] = 'F'

  gradeService.gradeColors = {
    # Fail
    # -1: '#808080'
    F: '#808080'
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

  gradeService.gradeColors[-1] = '#808080'

  gradeService.gradeFor = (project) ->
    gradeService.gradeNumbers[project.target_grade]

  gradeService
)
