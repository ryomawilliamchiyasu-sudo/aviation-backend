// Learn more: https://docs.expo.dev/guides/monorepos/
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

// Find the project and workspace directories
const projectRoot = __dirname;

const config = getDefaultConfig(projectRoot);

// Exclude backend-only files from bundling
config.resolver.blockList = [
  ...config.resolver.blockList,
  /\/src\//,  // Exclude backend services
  /server\.js/,
  /index\.js/,
  /render\.yaml/,
  /Dockerfile/,
];

module.exports = config;
