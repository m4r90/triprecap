const createExpoWebpackConfigAsync = require('@expo/webpack-config');
const webpack = require('webpack');

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync({
    ...env,
    favicon: false
  }, argv);
  
  // Ajout des fallbacks pour les modules Node.js
  config.resolve.fallback = {
    ...config.resolve.fallback,
    "crypto": require.resolve("crypto-browserify"),
    "stream": require.resolve("stream-browserify"),
    "buffer": require.resolve("buffer/"),
    "events": require.resolve("events/"),
    "vm": require.resolve("vm-browserify"),
    "assert": require.resolve("assert/"),
    "util": require.resolve("util/")
  };

  // Configuration pour gérer les fichiers d'icônes
  config.module.rules.push({
    test: /\.(ico|png|jpg|jpeg|gif)$/,
    loader: 'file-loader',
    options: {
      name: '[name].[ext]'
    }
  });

  // Ajout des plugins nécessaires
  config.plugins.push(
    new webpack.ProvidePlugin({
      process: 'process/browser',
      Buffer: ['buffer', 'Buffer'],
    })
  );

  return config;
}; 