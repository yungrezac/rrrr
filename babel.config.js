module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      'react-native-reanimated/plugin',
      ['module-resolver', {
        root: ['.'],
        alias: {
          '@': '.',
          'stream': 'stream-browserify',
          'crypto': 'crypto-browserify',
          'buffer': 'buffer',
          'process': 'process/browser',
        },
        extensions: [
          '.ios.ts',
          '.android.ts',
          '.ts',
          '.ios.tsx',
          '.android.tsx',
          '.tsx',
          '.jsx',
          '.js',
          '.json',
        ],
      }],
    ],
  };
};