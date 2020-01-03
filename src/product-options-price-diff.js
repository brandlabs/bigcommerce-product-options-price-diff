/**
 * Get price diff for product options.
 */


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
    scope: null,
};

class PriceDiff {
    /**
     * Initialize instance properties.
     *
     * @param options: Number
     */
    constructor(options) {
        this.priceDiffs = {};

        this.options = options;

        if (this.options.productId === null) {
            this.options.productId = document.querySelector(this.options.productIdSelector).value;
        }

        // Immediately load the prices
        if (this.options.autoload) {
            this.loadPrices();
        }
    }

    /**
     * Get starting product price (no options selected).
     * @return number
     */
    async getStartingPrice() {
        return this.getPrice();
    }

    /**
     * Get product price for the specified set of attributes.
     * @return number
     * @param attributes: Object
     */
    async getPrice(attributes) {
        let productAttributesData = await this.getProductAttributesData(attributes);
        let price;
        this.options.pricePath.split('.').forEach((priceWrapper) => {
            productAttributesData = productAttributesData[priceWrapper];
            price = productAttributesData;
        });
        this.onGetPrice(attributes, price, (optionValueId, priceDiff) => {
            this.updateConfig(optionValueId, priceDiff, () => {
                this.updateOptionLabel(optionValueId, priceDiff);
            })
        });
        return price;
    }

    /**
     * Get product attributes data for the specified set of attributes.
     * @return Promise
     * @param attributes: Object
     */
    getProductAttributesData(attributes) {
        const productId = this.options.productId;
        const template = this.options.template;
        const params = Object.assign({
            action: 'add',
            product_id: productId,
        }, attributes);
        return new Promise((resolve, reject) => {
            stencilUtils.api.productAttributes.optionChange(productId, this._queryParam(params), template, (err, response) => {
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
    async loadPrices(useCache = true) {
        if (useCache) {
            this.options.productOptions.forEach(productOption => {
                productOption.values.forEach(optionValue => {
                    const priceDiff =this.cacheStorage().get(optionValue.id);
                    if (priceDiff !== null) {
                        this.updateConfig(optionValue.id, priceDiff, () => {
                            this.updateOptionLabel(optionValue.id, priceDiff);
                        });
                    }
                });
            });
        }

        if (this.options.startingPrice === null) {
            this.options.startingPrice = await this.getStartingPrice();
        }

        if (!this.options.startingPrice && (this.options.startingPrice !== 0)) {
            throw new Error('Failed to obtain starting price.');
        }

        const promises = [];

        this.options.productOptions.forEach(productOption => {
            productOption.values.forEach(optionValue => {
                const attributes = {};
                attributes[`attribute[${productOption.id}]`] = optionValue.id;
                promises.push(this.getPrice(attributes));
            });
        });

        await Promise.all(promises);
        return this.priceDiffs;
    }

    /**
     * Method called each time a price is obtained from server.
     *
     * @param attributes: Number
     * @param price: Number
     * @param callback
     */
    onGetPrice(attributes, price, callback) {
        const keys = attributes ? Object.keys(attributes) : 0;
        if (keys.length === 1) {
            const optionValueId = attributes[keys[0]];
            const priceDiff = price - this.options.startingPrice;

            // Persist
            this.cacheStorage().set(optionValueId, priceDiff);

            if ( callback && typeof callback === "function") {
                callback(optionValueId, priceDiff);
            }
        }
    }

    /**
     * Method called each time a price diff is retrieved from cache or server.
     *
     * @param optionValueId: Number
     * @param priceDiff: Number
     * @param callback
     */
    updateConfig(optionValueId, priceDiff, callback) {
        this.priceDiffs[optionValueId] = priceDiff;

        if (typeof this.options.onGetPriceDiff === 'function') {
            this.options.onGetPriceDiff(optionValueId, priceDiff);
        } else {
            if (typeof callback === 'function') {
                callback()
            }
        }
    }

    /**
     *
     * @param optionValueId:Number
     * @param priceDiff:Number
     */
    updateOptionLabel(optionValueId, priceDiff) {
        const optionsSelectors = document.querySelectorAll(this.options.optionLabelSelector.replace('%f', optionValueId));
        optionsSelectors.forEach((optionSelector) => {
            let span = optionSelector.querySelector('span');

            if (span) {
                span.parentNode.removeChild(span);
            }
            span = document.createElement('span');
            span.classList.add('js-price-diff');

            if (priceDiff > 0) {
                span.innerText = `[Add $${priceDiff.toFixed(2)}]`;
                optionSelector.appendChild(span);
            } else if (priceDiff < 0) {
                span.innerText = `[Subtract $${Math.abs(priceDiff).toFixed(2)}]`;
                optionSelector.appendChild(span);
            }
        });
    }


    /**
     * cache storage
     * @param config
     * @return {{set(*, *=): void, get(*): any}|any}
     */
    cacheStorage(config) {
        if (!config || !config.key) {
            config = {
                key: `price-diff-${this.options.productId}-`
            }
        }

        return {
            get(id) {
                return JSON.parse(window.sessionStorage.getItem(`${config}${id}`) || 'null')
            },
            set(id, value) {
                window.sessionStorage.setItem(`${config}${id}`,  JSON.stringify(value));
            }
        }
    }

    /**
     * convert to url query param
     *
     */
    _queryParam(source) {
        const array = [];
        Object.keys(source).forEach((key) => array.push(encodeURIComponent(key) + "=" + encodeURIComponent(source[key])));

        return array.join("&");
    }
}

export default function productOptionsPriceDiff(options = {}) {
    // Create a new instance of PriceDiff,
    // merging the default options with the provided options.
    return new PriceDiff(Object.assign({}, defaultOptions, options));
}
