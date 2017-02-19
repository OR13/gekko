
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
    method.uo_log(this);
    method.cci_log(this);
};
method.check = function () {

    method.uo_check(this);
    method.cci_check(this);

    var advice;

    if (this.uo_advice === this.cci_advice && this.cci_advice !== undefined) {
        this.advice(this.cci_advice);
    } else {
        this.advice();
    }
    
}

module.exports = method;