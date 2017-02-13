const webpackDefaults = require('systematic').webpack_get_defaults(__dirname)

webpackDefaults.module.rules.push({ test: /\.dot$/, loader: 'dot-loader' })

module.exports = webpackDefaults
