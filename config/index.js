
module.exports = {
  database: require('./database'),
  passport: require('./passport'),

  filepath: process.env.SEWA_FILEPATH || global.appRoot,
}
