define(["require", "exports", 'modules/payPeriods', 'lodash'], function(require, exports, payPeriods, _) {
    var Estimate = (function () {
        function Estimate() {
            this.spent = total(this.expenses);
        }
        return Estimate;
    })();
    exports.Estimate = Estimate;

    function total(values) {
        var total = 0;
        for (var i = 0; i < values.length; i++) {
            total += values[i].amount;
        }
        return total;
    }

    var Estimates = (function () {
        function Estimates() {
            this.estimates = [];
            this.total = total(this.estimates);
        }
        return Estimates;
    })();
    exports.Estimates = Estimates;

    var Period = (function () {
        function Period() {
            this.transactions = [];
            this.total = total(this.transactions);
        }
        return Period;
    })();
    exports.Period = Period;

    var BiWeeklyBudget = (function () {
        function BiWeeklyBudget(firstPayDate) {
            this.Estimates = new Estimates();
            this.startingAmount = 0;
            this.payCheckAmount = 0;
            this.firstPeriod = new Period();
            this.secondPeriod = new Period();
            this.thirdPeriod = new Period();
            this.periods = [];
            var biWeeklyPayDateCalculator = new payPeriods.BiWeeklyPayDateCalculator();
            var payDates = biWeeklyPayDateCalculator.getPayDates(firstPayDate);
            var biWeeklyPayPeriodCalculator = new payPeriods.BiWeeklyPayPeriodCalculator();
            this.periods = biWeeklyPayPeriodCalculator.getPayPeriods(payDates);
        }
        BiWeeklyBudget.prototype.setStartingAmount = function (amount) {
            this.startingAmount = amount;
        };
        BiWeeklyBudget.prototype.setPayCheckAmount = function (amount) {
            this.payCheckAmount = amount;
        };

        BiWeeklyBudget.prototype.getEndingBalance = function (period) {
            if (period == 1) {
                return this.startingAmount - this.firstPeriod.total - this.Estimates.total;
            } else if (period == 2) {
                return this.getEndingBalance(1) + this.payCheckAmount - this.secondPeriod.total;
            } else if (period == 3) {
                return this.getEndingBalance(2) + this.payCheckAmount - this.thirdPeriod.total;
            }
            throw 'Invalid period, must be less than 4, was ' + period;
        };

        BiWeeklyBudget.prototype.getStartingBalance = function (period) {
            if (period == 2) {
                return this.getEndingBalance(1) + this.payCheckAmount;
            } else if (period == 3) {
                return this.getEndingBalance(2) + this.payCheckAmount;
            }
            throw 'Invalid period, must be either 2 or 3 given ' + period;
        };

        BiWeeklyBudget.prototype.modifyTransaction = function (index, transaction) {
            if (_.contains(this.periods[0], transaction.day)) {
                this.firstPeriod.transactions[index] = transaction;
            } else if (_.contains(this.periods[1], transaction.day)) {
                this.secondPeriod.transactions[index] = transaction;
            } else {
                this.thirdPeriod.transactions[index] = transaction;
            }
        };

        BiWeeklyBudget.prototype.addTransaction = function (transaction) {
            if (_.contains(this.periods[0], transaction.day)) {
                this.firstPeriod.transactions.push(transaction);
            } else if (_.contains(this.periods[1], transaction.day)) {
                this.secondPeriod.transactions.push(transaction);
            } else {
                this.thirdPeriod.transactions.push(transaction);
            }
        };

        BiWeeklyBudget.prototype.modifyEstimate = function (index, estimate) {
            this.Estimates[index] = estimate;
            ;
        };

        BiWeeklyBudget.prototype.addEstimate = function (estimate) {
            this.Estimates.estimates.push(estimate);
        };
        return BiWeeklyBudget;
    })();
    exports.BiWeeklyBudget = BiWeeklyBudget;
});
//# sourceMappingURL=budget.js.map
