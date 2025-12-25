module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: ['react-native-reanimated/plugin'],
    overrides: [
      {
        plugins: [
          ['@babel/plugin-transform-react-jsx-self', false],
          ['@babel/plugin-transform-react-jsx-source', false],
        ],
      },
    ],
  };
};
