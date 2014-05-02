define(["require", "exports", 'moment'], function(require, exports, moment) {
    var BiWeeklyPayDateCalculator = (function () {
        function BiWeeklyPayDateCalculator() {
        }
        BiWeeklyPayDateCalculator.prototype.getPayDates = function (firstPayDate) {
            var payDates = [];
            var payDate = moment(firstPayDate || '4/4/2014');

            while (payDate <= moment().startOf('day')) {
                payDate.add('weeks', 2); // get the next pay date
            }
            payDates.push(moment(payDate.subtract('weeks', 2)));
            payDates.push(moment(payDate.add('weeks', 2)));
            payDates.push(moment(payDate.add('weeks', 2)));
            payDates.push(moment(payDate.subtract('weeks', 4).add('months', 1)));
            return payDates;
        };
        return BiWeeklyPayDateCalculator;
    })();
    exports.BiWeeklyPayDateCalculator = BiWeeklyPayDateCalculator;

    var BiWeeklyPayPeriodCalculator = (function () {
        function BiWeeklyPayPeriodCalculator() {
        }
        BiWeeklyPayPeriodCalculator.prototype.getPayPeriods = function (payDates) {
            var payPeriods = [];
            payPeriods.push(this.getPayPeriod(payDates[0], payDates[1]));
            payPeriods.push(this.getPayPeriod(payDates[1], payDates[2]));
            payPeriods.push(this.getPayPeriod(payDates[2], payDates[3]));
            return payPeriods;
        };

        BiWeeklyPayPeriodCalculator.prototype.getPayPeriod = function (startMoment, endMoment) {
            var daysInRange = [];
            if (startMoment.month() == endMoment.month()) {
                for (var i = startMoment.date(); i < endMoment.date(); i++) {
                    daysInRange.push(i);
                }
            } else {
                for (var i = startMoment.date(); i <= startMoment.daysInMonth(); i++) {
                    daysInRange.push(i);
                }
                for (var i = 1; i < endMoment.date(); i++) {
                    daysInRange.push(i);
                }
            }
            return daysInRange;
        };
        return BiWeeklyPayPeriodCalculator;
    })();
    exports.BiWeeklyPayPeriodCalculator = BiWeeklyPayPeriodCalculator;
});
//# sourceMappingURL=payPeriods.js.map
