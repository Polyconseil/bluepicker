const webpackDefaults = require('systematic').webpack_get_defaults(__dirname)

// cf. https://github.com/webpack/webpack/issues/198 or https://github.com/moment/moment/issues/1435
webpackDefaults.module.noParse = [/moment.js/]

webpackDefaults.module.loaders.push({ test: /\.dot$/, loader: 'dot-loader' })

module.exports = webpackDefaults
