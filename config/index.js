const path = require('path');

module.exports = {
  database: require('./database'),
  passport: require('./passport'),

  filepath: process.env.SEWA_FILEPATH || global.appRoot,
  staticpath: process.env.SEWA_STATICPATH || process.env.SEWA_STATIC_PATH || path.join(global.appRoot, 'static'),
}
