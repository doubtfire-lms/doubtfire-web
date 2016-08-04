mod = angular.module("doubtfire.common.modals", [
  require('./about-doubtfire-modal/about-doubtfire-modal')
  require('./csv-result-modal/csv-result-modal')
  require('./progress-modal/progress-modal')
  require('./confirmation-modal/confirmation-modal')
])

module.exports = mod.name
