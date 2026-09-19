const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Permettre la résolution des modules WebAssembly pour expo-sqlite sur le web
config.resolver.assetExts.push('wasm');

module.exports = config;
