import * as path from "path";
const slsw = require("serverless-webpack");
import * as webpack from "webpack";

const config: webpack.Configuration = {
  mode: slsw.lib.webpack.isLocal ? "development" : "production",
  entry: slsw.lib.entries,
  resolve: {
    fallback: {
      "node:fs": require.resolve("fs"),
    },
    extensions: [".ts", ".tsx", ".js"],
  },
  target: "node",
  module: {
    rules: [
      {
        test: /\.(tsx?)$/,
        loader: "ts-loader",
        exclude: [
          [
            path.resolve(__dirname, "node_modules"),
            path.resolve(__dirname, ".serverless"),
            path.resolve(__dirname, ".webpack"),
          ],
        ],
      },
      {
        test: /\.node$/,
        loader: "node-loader",
      },
    ],
  },
};

module.exports = config;
