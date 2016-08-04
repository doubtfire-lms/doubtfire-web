mod = angular.module('doubtfire.projects', [
  require('./states/states')
  require('./project-viewer/project-viewer')
  require('./project-lab-list/project-lab-list')
  require('./project-outcome-alignment/project-outcome-alignment')
  require('./project-portfolio-wizard/project-portfolio-wizard')
  require('./project-progress-dashboard/project-progress-dashboard')
])

module.exports = mod.name
