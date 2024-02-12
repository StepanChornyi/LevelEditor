const { merge } = require('webpack-merge')
const common = require('./webpack.config.js')
const os = require('os');
const path = require('path');
const ModifySource = require("modify-source-webpack-plugin");

const DEV_SERVER_PORT = 3000;

module.exports = merge(common, {
  mode: 'development',
  devtool: 'inline-source-map',

  devServer: {
    port: DEV_SERVER_PORT,
    host: '0.0.0.0',
    devMiddleware: {
      publicPath: '/'
    },
  },

  plugins: [
    new class LogServerLinksPlugin {
      apply(compiler) {
        const ip = os.networkInterfaces().Ethernet[1].address;

        compiler.hooks.done.tap("LogServerLinksPlugin", () => {
          setTimeout(() => {
            console.log(`\n`);
            console.log('\x1b[94m%s\x1b[0m', `Localhost: http://localhost:${DEV_SERVER_PORT}/`);
            console.log('\x1b[94m%s\x1b[0m', `Network: http://${ip}:${DEV_SERVER_PORT}/`);
            console.log(`\n`);
          }, 300);
        });
      }
    },
    new ModifySource.ModifySourcePlugin({
      rules: [
        {
          test: /\.js$/,
          operations: [
            new ModifySource.ReplaceOperation(
              'all',
              '__dirname',
              '$FILE_PATH'
            ),
          ]
        }
      ]
    })
  ]
});