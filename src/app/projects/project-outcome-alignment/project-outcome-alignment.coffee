# Deprecated wrapper for the legacy project-outcome-alignment component.
# The outcomes feature source of truth is now:
# projects/states/outcomes/outcomes.coffee
#
# This directive is kept temporarily as a thin wrapper to avoid breaking
# any remaining references during transition. It should be removed once
# all references are confirmed deleted.

angular.module("doubtfire.projects.project-outcome-alignment", [])

.directive("projectOutcomeAlignment", ->
  restrict: 'E'
  templateUrl: 'projects/project-outcome-alignment/project-outcome-alignment.tpl.html'
)
