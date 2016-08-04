mod = angular.module("doubtfire.common", [
  require('./services/services')
  require('./filters/filters')
  require('./modals/modals')
  require('./header/header')
  require('./file-uploader/file-uploader')
  require('./pdf-panel-viewer/pdf-panel-viewer')
  require('./grade-icon/grade-icon')
  require('./status-icon/status-icon')
  require('./markdown-editor/markdown-editor')
  require('./alert-list/alert-list')
])

module.exports = mod.name
