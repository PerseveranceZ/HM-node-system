'use strict'

var getEnviromentInfo = (env) => {
  console.log('getEnviromentInfo>>>>' + env);
  return {
    NODE_ENV: '"' + process.env.NODE_ENV + '"',
    BASE_API: '"http://localhost:3001"'
  }

}

module.exports = getEnviromentInfo(process.env.NODE_ENV);

//
// module.exports = {
//     NODE_ENV: '"' + process.env.NODE_ENV +'"',
//     BASE_API: '"https://easy-mock.com/mock/5950a2419adc231f356a6636/vue-admin"',
//     NODE_API: '"http://localhost:3001"',
// }
