
/*
    A refactor of the default UO, for combining with other indicators...
*/

var config = require('../core/util.js').getConfig();
var log = require('../core/log.js');

var uo_settings = config.UO;

var UO = require('./indicators/UO.js');

// Let's create our own method
var method = {};

// Prepare everything our method needs
method.uo_init = function (self) {
    self.name = 'UO';
    self.uo_trend = {
        direction: 'none',
        duration: 0,
        persisted: false,
        adviced: false
    };
    self.requiredHistory = config.tradingAdvisor.historySize;
    // define the indicators we need
    self.addIndicator('uo', 'UO', uo_settings);
}
method.uo_log = function (self) {
    var digits = 8;
    var uo = self.indicators.uo;
    log.debug('calculated Ultimate Oscillator properties for candle:');
    log.debug('\t', 'UO:', uo.uo.toFixed(digits));
    log.debug('\t', 'price:', self.lastPrice.toFixed(digits));
}
method.uo_check = function (self) {
    var uo = self.indicators.uo;
    var uoVal = uo.uo;
    if (uoVal > uo_settings.thresholds.high) {
        // new trend detected
        if (self.uo_trend.direction !== 'high')
            self.uo_trend = {
                duration: 0,
                persisted: false,
                direction: 'high',
                adviced: false
            };
        self.uo_trend.duration++;
        // log.debug('In high since', self.uo_trend.duration, 'candle(s)');
        if (self.uo_trend.duration >= uo_settings.thresholds.persistence)
            self.uo_trend.persisted = true;
        if (self.uo_trend.persisted && !self.uo_trend.adviced) {
            self.uo_trend.adviced = true;
            self.uo_advice = 'short';
        } else
            self.uo_advice = undefined;
    } else if (uoVal < uo_settings.thresholds.low) {
        // new trend detected
        if (self.uo_trend.direction !== 'low')
            self.uo_trend = {
                duration: 0,
                persisted: false,
                direction: 'low',
                adviced: false
            };
        self.uo_trend.duration++;
        // log.debug('In low since', self.uo_trend.duration, 'candle(s)');
        if (self.uo_trend.duration >= uo_settings.thresholds.persistence)
            self.uo_trend.persisted = true;

        if (self.uo_trend.persisted && !self.uo_trend.adviced) {
            self.uo_trend.adviced = true;
            self.uo_advice = 'long';
        } else
            self.uo_advice = undefined;
    } else {
        // log.debug('In no trend');
        self.uo_advice = undefined;
    }
}

// combine them here...
method.init = function () {
    method.uo_init(this);
}
method.log = function () {
    method.uo_log(this);
};
method.check = function () {
    method.uo_check(this);
    if (this.uo_advice !== undefined) {
        this.advice(this.uo_advice);
    } else {
        this.advice();
    }
}

module.exports = method;