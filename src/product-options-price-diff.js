/**
 * Get price diff for product options.
 */

import $ from 'jquery';
import _ from 'lodash';
import utils from '@bigcommerce/stencil-utils';

const defaultOptions = {
    productOptions: [],
    productId: null,
    startingPrice: null,
    autoload: true,
    template: 'products/bulk-discount-rates',
    pricePath: 'price.without_tax.value',
    productIdSelector: 'input[name=product_id]',
    onGetPriceDiff: null,
    optionLabelSelector: 'label[data-product-attribute-value="%f"]',
};

class PriceDiff {
    /**
     * Initialize instance properties.
     *
     * @param object options
     */
    constructor(options) {
        this.priceDiffs = {};

        this.options = options;

        if (this.options.productId === null) {
            this.options.productId = $(this.options.productIdSelector).val();
        }

        // Immediately load the prices
        if (this.options.autoload) {
            this.loadPrices();
        }
    }

    /**
     * Get starting product price (no options selected).
     *
     * @return number
     */
    async getStartingPrice() {
        return await this.getPrice();
    }

    /**
     * Get product price for the specified set of attributes.
     *
     * @param  object attributes
     * @return number
     */
    async getPrice(attributes) {
        const productAttributesData = await this.getProductAttributesData(attributes);
        const price = _.get(productAttributesData, this.options.pricePath);
        this.onGetPrice(attributes, price);
        return price;
    }

    /**
     * Get product attributes data for the specified set of attributes.
     *
     * @param  object attributes
     * @return Promise
     */
    getProductAttributesData(attributes) {
        const productId = this.options.productId;
        const template = this.options.template;
        const params = Object.assign({
            action: 'add',
            product_id: productId,
        }, attributes);
        return new Promise((resolve, reject) => {
            utils.api.productAttributes.optionChange(productId, $.param(params), template, (err, response) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(response.data || {});
                }
            });
        });
    }

    /**
     * Get prices for product options.
     */
    async loadPrices() {
        const promises = [];
        let productOption;
        let optionValue;
        let attributes;
        let i;
        let j;

        if (this.options.startingPrice === null) {
            this.options.startingPrice = await this.getStartingPrice();
        }

        if (!this.options.startingPrice) {
            throw new Error('Failed to obtain starting price.');
        }

        for (i = 0; i < this.options.productOptions.length; i++) {
            productOption = this.options.productOptions[i];
            for (j = 0; j < productOption.values.length; j++) {
                optionValue = productOption.values[j];
                attributes = {};
                attributes[`attribute[${productOption.id}]`] = optionValue.id;
                promises.push(this.getPrice(attributes));
            }
        }

        await Promise.all(promises);   // eslint-disable-line no-unused-expressions

        return this.priceDiffs;
    }

    /**
     * Method called each time a price is obtained from server.
     *
     * @param  object attributes
     * @param  number price
     */
    onGetPrice(attributes, price) {
        const keys = attributes ? Object.keys(attributes) : 0;
        if (keys.length === 1) {
            const optionValueId = attributes[keys[0]];
            const priceDiff = price - this.options.startingPrice;

            this.priceDiffs[optionValueId] = priceDiff;

            if (typeof this.options.onGetPriceDiff === 'function') {
                this.options.onGetPriceDiff(optionValueId, priceDiff);
            } else {
                this.updateOptionLabel(optionValueId, priceDiff);
            }
        }
    }

    /**
     * Default "onGetPriceDiff" callback.
     * It appends an add/subtract text to the option label.
     *
     * @param  number optionValueId
     * @param  number priceDiff
     */
    updateOptionLabel(optionValueId, priceDiff) {
        const $label = $(this.options.optionLabelSelector.replace('%f', optionValueId));
        const $span = $('<span>').addClass('js-price-diff');
        $('.js-price-diff', $label).remove();

        if (priceDiff > 0) {
            $label.append($span.text(`[Add $${priceDiff.toFixed(2)}]`));
        } else if (priceDiff < 0) {
            $label.append($span.text(`[Subtract $${Math.abs(priceDiff).toFixed(2)}]`));
        }
    }
}

export default function productOptionsPriceDiff(options = {}) {
    // Create a new instance of PriceDiff,
    // merging the default options with the provided options.
    return new PriceDiff(Object.assign({}, defaultOptions, options));
}
