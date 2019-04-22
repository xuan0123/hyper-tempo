const path = require('path');
module.exports = {
	mode: 'development',
	devtool: 'none',
	entry: './src/index.js',
	output: {
		filename: 'bundle.js',
		path: path.resolve(__dirname, 'dist')
	},
	module: {
		rules: [
			{
				test: /\.flac$/,
				exclude: /node_modules/,
				use: {
					loader: 'file-loader',
					options: {
						name: '[name].[ext]',
						outputPath: 'audio'
					}
				}
			}
		]
	}
};
