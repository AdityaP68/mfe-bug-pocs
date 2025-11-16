const ModuleFederationPlugin = require("webpack/lib/container/ModuleFederationPlugin");
const deps = require("./package.json").dependencies;

module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      webpackConfig.output.publicPath = "auto";

      webpackConfig.plugins.push(
        new ModuleFederationPlugin({
          name: "host",
          remotes: {
            remoteMfe: "remoteMfe@http://localhost:3001/remoteEntry.js",
          },
          shared: {
            ...deps,
            react: {
              singleton: true,
              requiredVersion: deps.react,
            },
            "react-dom": {
              singleton: true,
              requiredVersion: deps["react-dom"],
            },
          },
        })
      );

      return webpackConfig;
    },
  },
  devServer: {
    port: 3000,
    headers: {
      "Access-Control-Allow-Origin": "*",
    },
  },
};
