#
# Doubtfire - A lightweight, modern learning management system
#
# Doubtfire is modularised into many modules, as indicated by the directory
# tree inside app/
#

# Require the CSS file explicitly (or it could be defined as an entry-point too).
require('../assets/styles/app.scss')

# angular-markdown-filter expects window.showdown to exist
window.showdown = require('showdown')
# angular-ui-codemirror expects window.CodeMirror
window.CodeMirror = require('codemirror')

# Initialize doubtfire application module
angular.module('doubtfire', [
  require('./config/config')
  require('./api/api')
  require('./sessions/sessions')
  require('./common/common')
  require('./errors/errors')
  require('./home/home')
  require('./units/units')
  require('./tasks/tasks')
  require('./projects/projects')
  require('./users/users')
  require('./groups/groups')
  require('./visualisations/visualisations')
])
