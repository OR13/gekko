
/*
    A custom strategy combining CCI and UO.
*/

var _ = require('lodash');
var config = require('../core/util.js').getConfig();
var log = require('../core/log.js');

// Let's create our own method
var method = {};

var or13_uo = require('./or13_uo');
var or13_cci = require('./or13_cci');
var or13_macd = require('./or13_macd');
var or13_ppo = require('./or13_ppo');

_.extend(method, or13_uo);
_.extend(method, or13_cci);
_.extend(method, or13_macd);
_.extend(method, or13_ppo);

// combine them here...
method.init = function () {
    method.uo_init(this);
    method.cci_init(this);
    method.ppo_init(this);
    method.macd_init(this);
}
method.log = function () {
    // method.uo_log(this);
    // method.cci_log(this);
    // method.ppo_log(this);
    // method.macd_log(this);
};

// this method takes advice weights and reduces to a single advice string.
method.advice_reducer = function (advice_weights) {
    // weights should sum to 1

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
    method.macd_check(this);
    method.ppo_check(this);

    var advice_weights = {
        uo: {
            advice: this.uo_advice,
            weight: .50
        },
        cci: {
            advice: this.cci_advice,
            weight: .20
        },
        macd: {
            advice: this.macd_advice,
            weight: .05
        },
        ppo: {
            advice: this.ppo_advice,
            weight: .05
        }
    }
    var advice = method.advice_reducer(advice_weights);
    // log.debug('advice: ', advice)
    this.advice(advice);
}

module.exports = method;

// (As Expected)

// UO
// (PROFIT REPORT) simulated yearly profit:	 449 725.55001 USDT (443954.14847%)

// CCI
// (PROFIT REPORT) simulated yearly profit:	 19 280.88471 USDT (19033.44996%)

// 50/50 UO/CCI
// (PROFIT REPORT) simulated yearly profit:	 53 580.46644 USDT (52892.85955%)

// 45/35/15/05 UO/CCI/MACD/PPO
// (PROFIT REPORT) simulated yearly profit:	 57 564.47477 USDT (56825.74045%)

// I'm pretty sure it is retarted do things this way....
// the quest to beat UO goes on...