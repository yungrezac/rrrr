const { getDefaultConfig } = require('expo/metro-config');
const { mergeConfig } = require('@react-native/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname, {
  isCSSEnabled: true,
});

config.resolver.sourceExts = [
  ...config.resolver.sourceExts,
  'mjs',
  'cjs',
];

config.resolver.assetExts = [...config.resolver.assetExts, 'db', 'sqlite'];

config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  stream: require.resolve('stream-browserify'),
  crypto: require.resolve('crypto-browserify'),
  buffer: require.resolve('buffer/'),
  process: require.resolve('process/browser'),
  'react-native-maps': 'react-native-web-maps',
};

config.resolver.alias = {
  ...config.resolver.alias,
  'stream': 'stream-browserify',
  'crypto': 'crypto-browserify',
  'react-native-maps': 'react-native-web-maps',
};

config.transformer.unstable_allowRequireContext = true;

module.exports = mergeConfig(getDefaultConfig(__dirname), config);