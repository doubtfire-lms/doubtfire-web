module.exports = {
  env: {
    options: {
      // Global Options
    },

    development: {
      API_URL  : 'http://localhost:3000/api',
      DEV_MODE : 'true',
      EXTERNAL_NAME: 'Doubtfire'
    },

    production: {
      API_URL  : 'https://doubtfire.ict.swin.edu.au/api',
      DEV_MODE : 'false',
      EXTERNAL_NAME: 'Doubtfire'
    },

    docker: {
      API_URL  : 'http://' + process.env.DOUBTFIRE_DOCKER_MACHINE_IP + ':3000/api',
      DEV_MODE : 'true',
      EXTERNAL_NAME: 'Doubtfire'
    }
  }
}