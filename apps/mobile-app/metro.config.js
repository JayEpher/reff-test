const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// 1. 跟随 monorepo 符号链接
// config.resolver.unstable_enableSymlinks = true;

// 2. 监视 monorepo 根目录和其他 workspace 包，保证热更新
config.watchFolders = [
  __dirname,
  path.resolve(__dirname, '../../'), // monorepo 根
  path.resolve(__dirname, '../../packages'), // 你的共享包目录
];

module.exports = config;
