
/*
    A custom strategy combining CCI and UO.
*/

var _ = require('lodash');
var config = require('../core/util.js').getConfig();
var log = require('../core/log.js');

// Let's create our own method
var method = {};

var steele_uo = require('./steele_uo');
var steele_cci = require('./steele_cci');

_.extend(method, steele_uo);
_.extend(method, steele_cci);

// combine them here...
method.init = function () {
    method.uo_init(this);
    method.cci_init(this);
}
method.log = function () {
    // method.uo_log(this);
    // method.cci_log(this);
};

// this method takes advice weights and reduces to a single advice string.
method.advice_reducer = function (advice_weights) {
    // weights should sum to 1

    var naive_majority = [];

    var advice = {
        "short": 0,
        "long": 0,
        "undefined": 0
    };

    _.each(advice_weights, (indicator) => {
        advice[indicator.advice] += indicator.weight;
    });

    // log.debug('weighted_advice: ', advice);
    return Object.keys(advice).reduce((a, b) => { return advice[a] > advice[b] ? a : b });

}

method.check = function () {

    method.uo_check(this);
    method.cci_check(this);

    var advice_weights = {
        uo: {
            advice: this.uo_advice,
            weight: .75
        },
        cci: {
            advice: this.cci_advice,
            weight: .25
        }
    }
    var advice = method.advice_reducer(advice_weights);
    // log.debug('advice: ', advice)
    this.advice(advice);
}

module.exports = method;