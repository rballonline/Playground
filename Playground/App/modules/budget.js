define(["require", "exports", '../modules/payPeriods', 'lodash'], function(require, exports, payPeriods, _) {
    var Transaction = (function () {
        function Transaction(day, isFor, amount) {
            this.day = day;
            this.isFor = isFor;
            this.amount = amount;
            this.id = guid();
        }
        return Transaction;
    })();
    exports.Transaction = Transaction;

    var Expense = (function () {
        function Expense(amount) {
            this.amount = amount;
            this.id = guid();
            this.date = moment();
        }
        return Expense;
    })();
    exports.Expense = Expense;

    var Estimate = (function () {
        function Estimate(name, amount) {
            var _this = this;
            this.spent = function () {
                return total(_this.expenses);
            };
            this.amountLeft = function () {
                return _this.amount - _this.spent();
            };
            this.name = name;
            this.amount = amount;
            this.id = guid();
        }
        return Estimate;
    })();
    exports.Estimate = Estimate;

    var Estimates = (function () {
        function Estimates() {
            var _this = this;
            this.estimates = [];
            this.total = function () {
                return total(_this.estimates);
            };
        }
        return Estimates;
    })();
    exports.Estimates = Estimates;

    var Period = (function () {
        function Period() {
            this.transactions = [];
        }
        Period.prototype.total = function () {
            return total(this.transactions);
        };
        Period.prototype.sort = function (period) {
            this.transactions = _.sortBy(this.transactions, function (transaction) {
                return period.indexOf(transaction.day);
            });
        };
        return Period;
    })();
    exports.Period = Period;

    var BiWeeklyBudget = (function () {
        function BiWeeklyBudget(firstPayDate) {
            var _this = this;
            this._estimates = new Estimates();
            this._startingAmount = 0;
            this._payCheckAmount = 0;
            this._firstPeriod = new Period();
            this._secondPeriod = new Period();
            this._thirdPeriod = new Period();
            this._offTheBooks = new Period();
            this._periods = [];
            this._payDates = [];
            var biWeeklyPayDateCalculator = new payPeriods.BiWeeklyPayDateCalculator();
            this._payDates = biWeeklyPayDateCalculator.getPayDates(firstPayDate);
            var biWeeklyPayPeriodCalculator = new payPeriods.BiWeeklyPayPeriodCalculator();
            this._periods = biWeeklyPayPeriodCalculator.getPayPeriods(this._payDates);

            amplify.subscribe('updating-starting-amount', function (newValue) {
                _this._startingAmount = parseFloat(newValue);
                _this.save();
                amplify.publish('starting-amount-updated');
            });
            amplify.subscribe('updating-paycheck-amount', function (newValue) {
                _this._payCheckAmount = parseFloat(newValue);
            });
        }
        BiWeeklyBudget.prototype.save = function () {
            var transactions = [];
            _.each(this._firstPeriod.transactions, function (t) {
                transactions.push(t);
            });
            _.each(this._secondPeriod.transactions, function (t) {
                transactions.push(t);
            });
            _.each(this._thirdPeriod.transactions, function (t) {
                transactions.push(t);
            });

            amplify.store('data', JSON.stringify({ _startingAmount: this._startingAmount, _payCheckAmount: this._payCheckAmount, transactions: transactions, _offTheBooks: this._offTheBooks.transactions, _estimates: this._estimates.estimates }));
        };

        BiWeeklyBudget.prototype.load = function () {
            var _this = this;
            try  {
                if (amplify.store('data')) {
                    var data = JSON.parse(amplify.store('data'));
                    this._startingAmount = data._startingAmount;
                    this._payCheckAmount = data._payCheckAmount;
                    this._firstPeriod.transactions = [];
                    this._secondPeriod.transactions = [];
                    this._thirdPeriod.transactions = [];

                    _.each(data.transactions, function (t) {
                        _this.manageTransaction(t);
                    });
                    _.each(data._offTheBooks, function (t) {
                        _this._offTheBooks.transactions.push(t);
                    });
                    _.each(data._estimates, function (e) {
                        _this._estimates.estimates.push(e);
                    });
                }
            } catch (e) {
                localStorage.removeItem('data');
                throw e;
            }
        };

        Object.defineProperty(BiWeeklyBudget.prototype, "payDates", {
            get: function () {
                return this._payDates;
            },
            enumerable: true,
            configurable: true
        });

        BiWeeklyBudget.prototype.getStartingAmount = function () {
            return this._startingAmount;
        };

        BiWeeklyBudget.prototype.getPaycheckAmount = function () {
            return this._payCheckAmount;
        };

        BiWeeklyBudget.prototype.getEndingBalance = function (period) {
            if (period == 0) {
                return this._startingAmount - this._firstPeriod.total();
            }
            if (period == 1) {
                return this._startingAmount - this._firstPeriod.total() - this._estimates.total();
            } else if (period == 2) {
                return this.getEndingBalance(1) + this._payCheckAmount - this._secondPeriod.total();
            } else if (period == 3) {
                return this.getEndingBalance(2) + this._payCheckAmount - this._thirdPeriod.total();
            }
            throw 'Invalid period, must be less than 4, was ' + period;
        };

        BiWeeklyBudget.prototype.getStartingBalance = function (period) {
            if (period == 2) {
                return this.getEndingBalance(1) + this._payCheckAmount;
            } else if (period == 3) {
                return this.getEndingBalance(2) + this._payCheckAmount;
            }
            throw 'Invalid period, must be either 2 or 3 given ' + period;
        };

        BiWeeklyBudget.prototype.getTransactions = function (period) {
            switch (period) {
                case 1:
                    return this._firstPeriod.transactions;
                case 2:
                    return this._secondPeriod.transactions;
                case 3:
                    return this._thirdPeriod.transactions;
                default:
                    throw 'Invalid period specified. Need 1 - 3, given: ' + period;
            }
        };

        BiWeeklyBudget.prototype.getPeriod = function (transaction) {
            if (_.contains(this._periods[0], transaction.day)) {
                return this._firstPeriod;
            } else if (_.contains(this._periods[1], transaction.day)) {
                return this._secondPeriod;
            }
            return this._thirdPeriod;
        };

        BiWeeklyBudget.prototype.getOffTheBooks = function () {
            return this._offTheBooks.transactions;
        };

        BiWeeklyBudget.prototype.getEstimates = function () {
            return this._estimates.estimates;
        };

        BiWeeklyBudget.prototype.moveTransactionOffTheBooks = function (transaction) {
            var period = this.getPeriod(transaction);
            var removed = _.first(_.remove(period.transactions, function (t) {
                return transaction.id == t.id;
            }));

            this._offTheBooks.transactions.push(removed);
        };

        BiWeeklyBudget.prototype.manageTransaction = function (transaction) {
            var period = this.getPeriod(transaction);
            period.transactions.push(transaction);
            amplify.publish('new-transaction', { period: period, transaction: transaction });
        };

        BiWeeklyBudget.prototype.manageEstimate = function (estimate) {
            var estimateToUpdate = _.find(this._estimates.estimates, function (e) {
                return e.id = estimate.id;
            });

            if (estimateToUpdate) {
                estimateToUpdate = estimate;
            } else {
                this._estimates.estimates.push(estimate);
            }
            amplify.publish('estimate-updated', estimateToUpdate);
        };

        BiWeeklyBudget.prototype.manageExpense = function (estimate, amount) {
        };
        return BiWeeklyBudget;
    })();
    exports.BiWeeklyBudget = BiWeeklyBudget;

    function guid() {
        var s = [];
        var hexDigits = "0123456789abcdef";
        for (var i = 0; i < 36; i++) {
            s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
        }
        s[14] = "4"; // bits 12-15 of the time_hi_and_version field to 0010
        s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1); // bits 6-7 of the clock_seq_hi_and_reserved to 01
        s[8] = s[13] = s[18] = s[23] = "-";

        var uuid = s.join("");
        return uuid;
    }

    function total(values) {
        var total = 0;
        for (var i = 0; i < values.length; i++) {
            total += values[i].amount;
        }
        return total;
    }
});
//# sourceMappingURL=budget.js.map
