angular.module("doubtfire.common", [
  # Services and filters
  'doubtfire.services'
  'doubtfire.filters'
  # Header and sidebar modules
  'doubtfire.common.header'
  'doubtfire.common.sidebar'
  'doubtfire.common.about-doubtfire-modal'
  # Custom directives
  'doubtfire.common.file-uploader'
  'doubtfire.common.pdf-panel-viewer'
  'doubtfire.common.grade-icon'
  'doubtfire.common.csv-result-modal'
  'doubtfire.common.markdown-editor'
])