#
# Doubtfire - A lightweight, modern learning management system
#
# Doubtfire is modularised into many modules, as indicated by the directory
# tree inside app/
#

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
