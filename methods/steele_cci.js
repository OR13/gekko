
/*
    A refactor of the default CCI, for combining with other indicators...
*/

var config = require('../core/util.js').getConfig();
var log = require('../core/log.js');

var cci_settings = config.CCI;

// Let's create our own method
var method = {};

// Prepare everything our method needs
method.cci_init = function (self) {
    self.requiredHistory = config.tradingAdvisor.historySize;
    self.cci_age = 0;
    self.cci_trend = {
        direction: 'undefined',
        duration: 0,
        persisted: false,
        adviced: false
    };
    self.historySize = config.tradingAdvisor.historySize;
    self.ppoadv = 'none';
    self.uplevel = config.CCI.thresholds.up;
    self.downlevel = config.CCI.thresholds.down;
    self.persisted = config.CCI.thresholds.persistence;
    // log.debug("CCI started with:\nup:\t", self.uplevel, "\ndown:\t", self.downlevel, "\npersistence:\t", self.persisted);
    // define the indicators we need
    self.addIndicator('cci', 'CCI', config.CCI);
}
method.cci_log = function (self) {
    var cci = self.indicators.cci;
    if (typeof (cci.result) == 'boolean') {
        log.debug('Insufficient data available. Age: ', cci.size, ' of ', cci.maxSize);
        log.debug('ind: ', cci.TP.result, ' ', cci.TP.age, ' ', cci.TP.depth);
        return;
    }
    log.debug('calculated CCI properties for candle:');
    log.debug('\t', 'Price:\t\t\t', self.lastPrice);
    log.debug('\t', 'CCI tp:\t', cci.tp.toFixed(8));
    log.debug('\t', 'CCI tp/n:\t', cci.TP.result.toFixed(8));
    log.debug('\t', 'CCI md:\t', cci.mean.toFixed(8));
    if (typeof (cci.result) == 'boolean')
        log.debug('\t In sufficient data available.');
    else
        log.debug('\t', 'CCI:\t', cci.result.toFixed(2));
}
method.cci_check = function (self) {
    var price = self.lastPrice;
    var cci = self.indicators.cci;
    self.cci_age++;
    if (typeof (cci.result) == 'number') {
        // overbought?
        if (cci.result >= self.uplevel && (self.cci_trend.persisted || self.persisted == 0) && !self.cci_trend.adviced && self.cci_trend.direction == 'overbought') {
            self.cci_trend.adviced = true;
            self.cci_trend.duration++;
            self.cci_advice = 'short';
        } else if (cci.result >= self.uplevel && self.cci_trend.direction != 'overbought') {
            self.cci_trend.duration = 1;
            self.cci_trend.direction = 'overbought';
            self.cci_trend.persisted = false;
            self.cci_trend.adviced = false;
            if (self.persisted == 0) {
                self.cci_trend.adviced = true;
                self.cci_advice = 'short';
            }
        } else if (cci.result >= self.uplevel) {
            self.cci_trend.duration++;
            if (self.cci_trend.duration >= self.persisted) {
                self.cci_trend.persisted = true;
            }
        } else if (cci.result <= self.downlevel && (self.cci_trend.persisted || self.persisted == 0) && !self.cci_trend.adviced && self.cci_trend.direction == 'oversold') {
            self.cci_trend.adviced = true;
            self.cci_trend.duration++;
            self.cci_advice = 'long';
        } else if (cci.result <= self.downlevel && self.cci_trend.direction != 'oversold') {
            self.cci_trend.duration = 1;
            self.cci_trend.direction = 'oversold';
            self.cci_trend.persisted = false;
            self.cci_trend.adviced = false;
            if (self.persisted == 0) {
                self.cci_trend.adviced = true;
                self.cci_advice = 'long';
            }
        } else if (cci.result <= self.downlevel) {
            self.cci_trend.duration++;
            if (self.cci_trend.duration >= self.persisted) {
                self.cci_trend.persisted = true;
            }
        } else {
            if (self.cci_trend.direction != 'nodirection') {
                self.cci_trend = {
                    direction: 'nodirection',
                    duration: 0,
                    persisted: false,
                    adviced: false
                };
            } else {
                self.cci_trend.duration++;
            }
            self.cci_advice = undefined;
        }
    } else {
        self.cci_advice = undefined;
    }
    log.debug("Trend: ", self.cci_trend.direction, " for ", self.cci_trend.duration);
}

// combine them here...
method.init = function () {
    method.cci_init(this);
}
method.log = function () {
    method.cci_log(this);
};
method.check = function () {
    method.cci_check(this);
    if (this.cci_advice !== undefined) {
        this.advice(this.cci_advice);
    } else {
        this.advice();
    }
    //  27435.69580 USDT
}

module.exports = method;