# Parent projects module.
# Outcomes source of truth now lives in projects.states.outcomes.
# project-outcome-alignment has been deprecated and removed from the
# parent dependency list as part of outcomes consolidation.

angular.module('doubtfire.projects', [
  'doubtfire.projects.states'
  'doubtfire.projects.project-progress-dashboard'
])
