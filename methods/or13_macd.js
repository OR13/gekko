
/*
    A refactor of the default CCI, for combining with other indicators...
*/

var config = require('../core/util.js').getConfig();
var log = require('../core/log.js');

var macd_settings = config.MACD;

// Let's create our own method
var method = {};

// Prepare everything our method needs
method.macd_init = function (self) {
    self.name = "MACD"

    // keep state about the current trend
    // here, on every new candle we use self
    // state object to check if we need to
    // report it.
    self.macd_trend = {
        direction: 'none',
        duration: 0,
        persisted: false,
        adviced: false
    };

    // how many candles do we need as a base
    // before we can start giving advice?
    self.requiredHistory = config.tradingAdvisor.historySize;

    // define the indicators we need
    self.addIndicator('macd', 'MACD', macd_settings);
}
method.macd_log = function (self) {
    var digits = 8;
    var macd = self.indicators.macd;

    var diff = macd.diff;
    var signal = macd.signal.result;

    log.debug('calculated MACD properties for candle:');
    log.debug('\t', 'short:', macd.short.result.toFixed(digits));
    log.debug('\t', 'long:', macd.long.result.toFixed(digits));
    log.debug('\t', 'macd:', diff.toFixed(digits));
    log.debug('\t', 'signal:', signal.toFixed(digits));
    log.debug('\t', 'macdiff:', macd.result.toFixed(digits));
}
method.macd_check = function (self) {
    var macddiff = self.indicators.macd.result;

    if (macddiff > macd_settings.thresholds.up) {

        // new trend detected
        if (self.macd_trend.direction !== 'up')
            // reset the state for the new trend
            self.macd_trend = {
                duration: 0,
                persisted: false,
                direction: 'up',
                adviced: false
            };

        self.macd_trend.duration++;

        // log.debug('In uptrend since', self.macd_trend.duration, 'candle(s)');

        if (self.macd_trend.duration >= macd_settings.thresholds.persistence)
            self.macd_trend.persisted = true;

        if (self.macd_trend.persisted && !self.macd_trend.adviced) {
            self.macd_trend.adviced = true;
            self.macd_advice = 'long';
        } else
            self.macd_advice = undefined;

    } else if (macddiff < macd_settings.thresholds.down) {

        // new trend detected
        if (self.macd_trend.direction !== 'down')
            // reset the state for the new trend
            self.macd_trend = {
                duration: 0,
                persisted: false,
                direction: 'down',
                adviced: false
            };

        self.macd_trend.duration++;

        // log.debug('In downtrend since', self.macd_trend.duration, 'candle(s)');

        if (self.macd_trend.duration >= macd_settings.thresholds.persistence)
            self.macd_trend.persisted = true;

        if (self.macd_trend.persisted && !self.macd_trend.adviced) {
            self.macd_trend.adviced = true;
            self.macd_advice = 'short';
        } else
            self.macd_advice = undefined;

    } else {

        // log.debug('In no trend');

        // we're not in an up nor in a downtrend
        // but for now we ignore sideways trends
        // 
        // read more @link:
        // 
        // https://github.com/askmike/gekko/issues/171

        // self.macd_trend = {
        //   direction: 'none',
        //   duration: 0,
        //   persisted: false,
        //   adviced: false
        // };

        self.macd_advice = undefined;
    }
}

// combine them here...
method.init = function () {
    method.macd_init(this);
}
method.log = function () {
    method.macd_log(this);
};
method.check = function () {
    method.macd_check(this);
    if (this.macd_advice !== undefined) {
        this.advice(this.macd_advice);
    } else {
        this.advice();
    }
}

module.exports = method;