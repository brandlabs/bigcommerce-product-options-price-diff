!function(t){var e={};function i(o){if(e[o])return e[o].exports;var n=e[o]={i:o,l:!1,exports:{}};return t[o].call(n.exports,n,n.exports,i),n.l=!0,n.exports}i.m=t,i.c=e,i.d=function(t,e,o){i.o(t,e)||Object.defineProperty(t,e,{enumerable:!0,get:o})},i.r=function(t){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:!0})},i.t=function(t,e){if(1&e&&(t=i(t)),8&e)return t;if(4&e&&"object"==typeof t&&t&&t.__esModule)return t;var o=Object.create(null);if(i.r(o),Object.defineProperty(o,"default",{enumerable:!0,value:t}),2&e&&"string"!=typeof t)for(var n in t)i.d(o,n,function(e){return t[e]}.bind(null,n));return o},i.n=function(t){var e=t&&t.__esModule?function(){return t.default}:function(){return t};return i.d(e,"a",e),e},i.o=function(t,e){return Object.prototype.hasOwnProperty.call(t,e)},i.p="",i(i.s=0)}([function(t,e,i){"use strict";i.r(e),i.d(e,"default",(function(){return r}));const o={productOptions:[],productId:null,startingPrice:null,autoload:!0,template:"products/bulk-discount-rates",pricePath:"price.without_tax.value",productIdSelector:"input[name=product_id]",onGetPriceDiff:null,optionLabelSelector:'label[data-product-attribute-value="%f"]',scope:null};class n{constructor(t){this.priceDiffs={},this.options=t,null===this.options.productId&&(this.options.productId=document.querySelector(this.options.productIdSelector).value),this.options.autoload&&this.loadPrices()}async getStartingPrice(){return this.getPrice()}async getPrice(t){let e,i=await this.getProductAttributesData(t);return this.options.pricePath.split(".").forEach(t=>{i=i[t],e=i}),this.onGetPrice(t,e,(t,e)=>{this.updateConfig(t,e,()=>{this.updateOptionLabel(t,e)})}),e}getProductAttributesData(t){const e=this.options.productId,i=this.options.template,o=Object.assign({action:"add",product_id:e},t);return new Promise((t,n)=>{stencilUtils.api.productAttributes.optionChange(e,this._queryParam(o),i,(e,i)=>{e?n(e):t(i.data||{})})})}async loadPrices(t=!0){if(t&&this.options.productOptions.forEach(t=>{t.values.forEach(t=>{const e=this.cacheStorage().get(t.id);null!==e&&this.updateConfig(t.id,e,()=>{this.updateOptionLabel(t.id,e)})})}),null===this.options.startingPrice&&(this.options.startingPrice=await this.getStartingPrice()),!this.options.startingPrice&&0!==this.options.startingPrice)throw new Error("Failed to obtain starting price.");const e=[];return this.options.productOptions.forEach(t=>{t.values.forEach(i=>{const o={};o[`attribute[${t.id}]`]=i.id,e.push(this.getPrice(o))})}),await Promise.all(e),this.priceDiffs}onGetPrice(t,e,i){const o=t?Object.keys(t):0;if(1===o.length){const n=t[o[0]],r=e-this.options.startingPrice;this.cacheStorage().set(n,r),i&&"function"==typeof i&&i(n,r)}}updateConfig(t,e,i){this.priceDiffs[t]=e,"function"==typeof this.options.onGetPriceDiff?this.options.onGetPriceDiff(t,e):"function"==typeof i&&i()}updateOptionLabel(t,e){document.querySelectorAll(this.options.optionLabelSelector.replace("%f",t)).forEach(t=>{let i=t.querySelector("span");i&&i.parentNode.removeChild(i),i=document.createElement("span"),i.classList.add("js-price-diff"),e>0?(i.innerText=`[Add $${e.toFixed(2)}]`,t.appendChild(i)):e<0&&(i.innerText=`[Subtract $${Math.abs(e).toFixed(2)}]`,t.appendChild(i))})}cacheStorage(t){return t&&t.key||(t={key:`price-diff-${this.options.productId}-`}),{get:e=>JSON.parse(window.sessionStorage.getItem(`${t}${e}`)||"null"),set(e,i){window.sessionStorage.setItem(`${t}${e}`,JSON.stringify(i))}}}_queryParam(t){const e=[];return Object.keys(t).forEach(i=>e.push(encodeURIComponent(i)+"="+encodeURIComponent(t[i]))),e.join("&")}}function r(t={}){return new n(Object.assign({},o,t))}}]);