# BigCommerce product options price diff

Get price diff for product options in BigCommerce.

Purpose: display the value of price rule adjustments next to the corresponding product option, in a Stencil theme.

## Install

```sh
npm install brandlabs/bigcommerce-product-options-price-diff
```

## Usage

**Step 1**: Adjust Webpack configuration:

First, include this module's folder in `webpack.common.js` config for `babel-loader`.

Just add `|bigcommerce-product-options-price-diff` after `stencil-utils` in the `include` line:

```js
{
    module: {
        rules: [
            {
                test: /\.js$/,
                include: /(assets\/js|assets\\js|stencil-utils|bigcommerce-product-options-price-diff)/,
                use: {
                    loader: 'babel-loader'
                }
            }
        }
    }
}
```

Then, in the `plugins` section, add the `paths: true` setting to the LodashPlugin:

```
    new LodashPlugin({ paths: true }), // Complements babel-plugin-lodash by shrinking its cherry-picked builds further.
```

<hr>

**Step 2**: Inject `product.options` in `product-view.html`.

Just add the following line at the top of `templates/components/products/product-view.html` and `templates/components/amp/products/product-view.html`:

```handlebars
{{inject 'productOptions' product.options}}
```

<hr>

**Step 3**: Import the module code and call the initialization function.

The most recommended place for this is at `assets/js/theme/common/product-details.js`.

First, add the following line to the "imports" section at the top:

```js
import productOptionsPriceDiff from 'bigcommerce-product-options-price-diff';
```

Then, add the following line inside the `constructor` function:

```js
    productOptionsPriceDiff({ productOptions: this.context.productOptions });
```

You are done.

The product price differences shall appear after each product option label which adds to or subtracts from the price.

## Settings

You can further control the functionality by providing specific settings to the object passed as argument to `productOptionsPriceDiff` call.

This function returns a `PriceDiff` instance, which can also be used for more advanced customization.

Check `src/product-options-price-diff.js` file for details.
