module.exports = {
  env: {
    options: {
      // Global Options
    },

    development: {
      API_URL  : 'http://localhost:3000/api',
      DEV_MODE : 'true'
    },

    production: {
      API_URL  : 'https://doubtfire.ict.swin.edu.au/api',
      DEV_MODE : 'false'
    },

    docker: {
      API_URL  : 'http://' + process.env.DOUBTFIRE_DOCKER_MACHINE_IP + ':3000/api',
      DEV_MODE : 'true'
    }
  }
}
