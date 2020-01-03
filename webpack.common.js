const path = require('path');

module.exports  = {
    entry: './src/product-options-price-diff.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'product-options-price-diff.js',
    }
}
