define(["require", "exports", '../modules/payPeriods', 'lodash'], function(require, exports, payPeriods, _) {
    var Savings = (function () {
        function Savings(forAmount, amount, currentSavings, contributing) {
            this.forAmount = forAmount;
            this.id = guid();
            this.amount = amount;
            this.currentSavings = currentSavings;
            this.contributing = contributing;
        }
        Savings.prototype.getBalance = function () {
            return this.contributing + this.currentSavings;
        };

        Savings.prototype.getPeriodsLeft = function () {
            var i = 0;
            var balance = this.currentSavings;
            if (this.contributing && this.contributing > 0) {
                while (this.currentSavings < this.amount) {
                    balance += this.contributing;
                    i++;
                }
            }
            return i;
        };
        return Savings;
    })();
    exports.Savings = Savings;

    var Transaction = (function () {
        function Transaction(day, forAmount, amount) {
            this.day = day;
            this.forAmount = forAmount;
            this.amount = amount;
            this.id = guid();
        }
        return Transaction;
    })();
    exports.Transaction = Transaction;

    var Expense = (function () {
        function Expense(amount, parentId) {
            this.amount = amount;
            this.parentId = parentId;
            this.id = guid();
            this.dateEntered = moment().format('M/D');
        }
        return Expense;
    })();
    exports.Expense = Expense;

    var Estimate = (function () {
        function Estimate(forAmount, amount) {
            var _this = this;
            this.expenses = [];
            this.total = function () {
                return total(_this.expenses);
            };
            this.amountLeft = function () {
                return _this.amount - _this.total();
            };
            this.forAmount = forAmount;
            this.amount = amount;
            this.id = guid();
            this.reallyAnEstimate = 'yeah!';
        }
        return Estimate;
    })();
    exports.Estimate = Estimate;

    var Estimates = (function () {
        function Estimates() {
            this.estimates = [];
        }
        Estimates.prototype.total = function () {
            return total(this.estimates);
        };
        return Estimates;
    })();
    exports.Estimates = Estimates;

    var Period = (function () {
        function Period(period) {
            this.transactions = [];
            this.daysInPeriod = [];
            this.period = period;
        }
        Period.prototype.total = function () {
            return total(this.transactions);
        };
        Period.prototype.sort = function () {
            var _this = this;
            this.transactions = _.sortBy(this.transactions, function (transaction) {
                return _this.daysInPeriod.indexOf(transaction.day);
            });
        };
        return Period;
    })();
    exports.Period = Period;

    var BiWeeklyBudget = (function () {
        function BiWeeklyBudget(firstPayDate) {
            var _this = this;
            this._estimates = new Estimates();
            this._savings = [];
            this._startingAmount = 0;
            this._payCheckAmount = 0;
            this._firstPeriod = new Period(1);
            this._secondPeriod = new Period(2);
            this._thirdPeriod = new Period(3);
            this._offTheBooks = [];
            this._periods = [];
            this._payDates = [];
            this.getEstimates = function () {
                return _this._estimates.estimates;
            };
            var biWeeklyPayDateCalculator = new payPeriods.BiWeeklyPayDateCalculator();
            this._payDates = biWeeklyPayDateCalculator.getPayDates(firstPayDate);
            var biWeeklyPayPeriodCalculator = new payPeriods.BiWeeklyPayPeriodCalculator();

            var periods = biWeeklyPayPeriodCalculator.getPayPeriods(this._payDates);
            this._firstPeriod.daysInPeriod = periods[0];
            this._secondPeriod.daysInPeriod = periods[1];
            this._thirdPeriod.daysInPeriod = periods[2];

            amplify.subscribe('updating-starting-amount', function (newValue) {
                _this._startingAmount = parseFloat(newValue);
                _this.save();
                amplify.publish('update-totals');
            });
            amplify.subscribe('updating-paycheck-amount', function (newValue) {
                _this._payCheckAmount = parseFloat(newValue);
                _this.save();
                amplify.publish('update-totals');
            });

            amplify.subscribe('updating-transaction-is-for', function (transaction, newValue) {
                transaction.forAmount = newValue;
                _this.save();
            });

            amplify.subscribe('updating-transaction-amount', function (transaction, newValue) {
                transaction.amount = parseFloat(newValue);
                _this.save();
                amplify.publish('update-totals');
            });

            amplify.subscribe('updating-transaction-day', function (transaction, newValue) {
                // This might be easier if we just had one transactions list...
                var period = _this.getPeriod(transaction);
                _.remove(period.transactions, function (t) {
                    return transaction.id == t.id;
                });
                transaction.day = parseFloat(newValue);
                var newPeriod = _this.getPeriod(transaction);
                newPeriod.transactions.push(transaction);
                _this.save();
                amplify.publish('update-periods');
            });
        }
        BiWeeklyBudget.prototype.addSavings = function (savings) {
            this._savings.push(savings);
            this.save();
            amplify.publish('add-savings', savings);
        };

        BiWeeklyBudget.prototype.addTransaction = function (transaction) {
            var period = this.getPeriod(transaction);
            period.transactions.push(transaction);
            period.sort();
            this.save();
            amplify.publish('update-periods', period);
        };

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

            amplify.store('data', JSON.stringify({ startingAmount: this._startingAmount, payCheckAmount: this._payCheckAmount, transactions: transactions, offTheBooks: this._offTheBooks, estimates: this._estimates.estimates, savings: this._savings }));
        };

        BiWeeklyBudget.prototype.load = function () {
            var _this = this;
            try  {
                if (amplify.store('data')) {
                    var data = JSON.parse(amplify.store('data'));
                    this._startingAmount = data.startingAmount;
                    this._payCheckAmount = data.payCheckAmount;
                    this._firstPeriod.transactions = [];
                    this._secondPeriod.transactions = [];
                    this._thirdPeriod.transactions = [];

                    _.each(data.transactions, function (t) {
                        var period = _this.getPeriod(t);
                        period.transactions.push(new Transaction(t.day, t.forAmount, t.amount));
                        period.sort();
                    });
                    _.each(data.offTheBooks, function (t) {
                        _this._offTheBooks.push(new Transaction(t.day, t.forAmount, t.amount));
                    });
                    _.each(data.estimates, function (e) {
                        var estimate = new Estimate(e.forAmount, e.amount);
                        _this._estimates.estimates.push(estimate);

                        _.each(e.expenses, function (ex) {
                            estimate.expenses.push(new Expense(ex.amount, estimate.id));
                        });
                    });
                    _.each(data.savings, function (s) {
                        _this._savings.push(new Savings(s.forAmount, s.amount, s.currentSavings, s.contributing));
                    });
                    amplify.publish('update-all');
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

        BiWeeklyBudget.prototype.moveTransaction = function (id) {
            var transaction = this.getTransaction(id);
            var period = this.getPeriod(transaction);
            var removed = _.remove(period.transactions, function (t) {
                return transaction.id == t.id;
            });

            this._offTheBooks.push(_.first(removed));
            this.save();
            amplify.publish('update-all');
        };

        BiWeeklyBudget.prototype.reAddTransaction = function (id) {
            var transaction = _.first(_.remove(this._offTheBooks, function (tx) {
                return tx.id == id;
            }));
            this.addTransaction(transaction);
            this.save();
            amplify.publish('update-all');
        };

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

        BiWeeklyBudget.prototype.updateExpenseAmount = function (expense, value) {
            expense.amount = parseFloat(value);
            var estimate = _.find(this._estimates.estimates, function (estimate) {
                return estimate.id == expense.parentId;
            });
            amplify.publish('modified-expense', estimate, expense);
        };

        BiWeeklyBudget.prototype.updateEstimateAmount = function (estimate, value) {
            estimate.amount = parseFloat(value);
            amplify.publish('update-totals');
        };

        BiWeeklyBudget.prototype.udpateEstimateFor = function (estimate, value) {
            estimate.forAmount = value;
            this.save();
        };

        BiWeeklyBudget.prototype.getPeriod = function (transaction) {
            if (_.contains(this._firstPeriod.daysInPeriod, transaction.day)) {
                return this._firstPeriod;
            } else if (_.contains(this._secondPeriod.daysInPeriod, transaction.day)) {
                return this._secondPeriod;
            }
            return this._thirdPeriod;
        };

        BiWeeklyBudget.prototype.getOffTheBooks = function () {
            return this._offTheBooks;
        };

        BiWeeklyBudget.prototype.getTransaction = function (id) {
            var transaction = _.find(this._firstPeriod.transactions, function (t) {
                return t.id == id;
            });
            if (transaction)
                return transaction;
            transaction = _.find(this._secondPeriod.transactions, function (t) {
                return t.id == id;
            });
            if (transaction)
                return transaction;
            transaction = _.find(this._thirdPeriod.transactions, function (t) {
                return t.id == id;
            });
            if (transaction)
                return transaction;
        };

        BiWeeklyBudget.prototype.addEstimate = function (estimate) {
            this._estimates.estimates.push(estimate);
            this.save();
            amplify.publish('update-estimates');
        };

        BiWeeklyBudget.prototype.removeEstimate = function (id) {
            _.remove(this._estimates.estimates, function (e) {
                return e.id == id;
            });
            this.save();
            amplify.publish('update-estimates');
        };

        BiWeeklyBudget.prototype.addExpense = function (id, amount) {
            var estimate = _.find(this._estimates.estimates, function (estimate) {
                return estimate.id == id;
            });
            var expense = new Expense(parseFloat(amount), estimate.id);
            estimate.expenses.push(expense);
            this.save();
            amplify.publish('add-expense', estimate, expense);
        };

        BiWeeklyBudget.prototype.removeExpense = function (estimateId, expenseId) {
            var estimate = _.find(this._estimates.estimates, function (estimate) {
                return estimate.id == estimateId;
            });
            _.remove(estimate.expenses, function (expense) {
                return expense.id == expenseId;
            });
            amplify.publish('remove-expense', estimate, expenseId);
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
