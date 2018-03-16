const webpackConfig = require('./webpack.config.js')
const karmaDefaults = require('systematic').karma_get_defaults(__dirname, webpackConfig)

module.exports = (karma) => karma.set(karmaDefaults)
