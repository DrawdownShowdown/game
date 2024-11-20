const path = require('path');

module.exports = {
  style: {
    postcss: {
      plugins: [
        require('tailwindcss'),
        require('autoprefixer'),
      ],
    },
  },
  webpack: {
    configure: (webpackConfig) => {
      webpackConfig.resolve.extensions = ['.tsx', '.ts', '.jsx', '.js', '.json', '.css'];
      return webpackConfig;
    }
  }
};