
/*
    A refactor of the default PPO, for combining with other indicators...
*/

var config = require('../core/util.js').getConfig();
var log = require('../core/log.js');

var ppo_settings = config.PPO;

// Let's create our own method
var method = {};

// Prepare everything our method needs
method.ppo_init = function (self) {
    self.ppo_trend = {
        direction: 'none',
        duration: 0,
        persisted: false,
        adviced: false
    };

    self.requiredHistory = config.tradingAdvisor.historySize;

    // define the indicators we need
    self.addIndicator('ppo', 'PPO', ppo_settings);
}
method.ppo_log = function (self) {

    var digits = 8;
    var ppo = self.indicators.ppo;
    var short = ppo.short.result;
    var long = ppo.long.result;
    var macd = ppo.macd;
    var result = ppo.ppo;
    var macdSignal = ppo.MACDsignal.result;
    var ppoSignal = ppo.PPOsignal.result;

    log.debug('calculated MACD properties for candle:');
    log.debug('\t', 'short:', short.toFixed(digits));
    log.debug('\t', 'long:', long.toFixed(digits));
    log.debug('\t', 'macd:', macd.toFixed(digits));
    log.debug('\t', 'macdsignal:', macdSignal.toFixed(digits));
    log.debug('\t', 'machist:', (macd - macdSignal).toFixed(digits));
    log.debug('\t', 'ppo:', result.toFixed(digits));
    log.debug('\t', 'pposignal:', ppoSignal.toFixed(digits));
    log.debug('\t', 'ppohist:', (result - ppoSignal).toFixed(digits));


}
method.ppo_check = function (self) {
    var price = self.lastPrice;

    var ppo = self.indicators.ppo;
    var long = ppo.long.result;
    var short = ppo.short.result;
    var macd = ppo.macd;
    var result = ppo.ppo;
    var macdSignal = ppo.MACDsignal.result;
    var ppoSignal = ppo.PPOsignal.result;

    // TODO: is self part of the indicator or not?
    // if it is it should move there
    var ppoHist = result - ppoSignal;

    if (ppoHist > ppo_settings.thresholds.up) {

        // new trend detected
        if (self.ppo_trend.direction !== 'up')
            self.ppo_trend = {
                duration: 0,
                persisted: false,
                direction: 'up',
                adviced: false
            };

        self.ppo_trend.duration++;

        // log.debug('In uptrend since', self.ppo_trend.duration, 'candle(s)');

        if (self.ppo_trend.duration >= ppo_settings.thresholds.persistence)
            self.ppo_trend.persisted = true;

        if (self.ppo_trend.persisted && !self.ppo_trend.adviced) {
            self.ppo_trend.adviced = true;
            self.ppo_advice = 'long';
        } else
            self.ppo_advice = undefined;

    } else if (ppoHist < ppo_settings.thresholds.down) {

        // new trend detected
        if (self.ppo_trend.direction !== 'down')
            self.ppo_trend = {
                duration: 0,
                persisted: false,
                direction: 'down',
                adviced: false
            };

        self.ppo_trend.duration++;

        // log.debug('In downtrend since', self.ppo_trend.duration, 'candle(s)');

        if (self.ppo_trend.duration >= ppo_settings.thresholds.persistence)
            self.ppo_trend.persisted = true;

        if (self.ppo_trend.persisted && !self.ppo_trend.adviced) {
            self.ppo_trend.adviced = true;
            self.ppo_advice = 'short';
        } else
            self.ppo_advice = undefined;


    } else {

        // log.debug('In no trend');

        // we're not in an up nor in a downtrend
        // but for now we ignore sideways trends
        // 
        // read more @link:
        // 
        // https://github.com/askmike/gekko/issues/171

        // self.ppo_trend = {
        //   direction: 'none',
        //   duration: 0,
        //   persisted: false,
        //   adviced: false
        // };

        self.ppo_advice = undefined;
    }
}

// combine them here...
method.init = function () {
    method.ppo_init(this);
}
method.log = function () {
    method.ppo_log(this);
};
method.check = function () {
    method.ppo_check(this);
    if (this.ppo_advice !== undefined) {
        this.advice(this.ppo_advice);
    } else {
        this.advice();
    }
}

module.exports = method;