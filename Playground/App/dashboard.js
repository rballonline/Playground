define(["require", "exports", 'modules/payPeriods', 'knockout', 'lodash', 'moment'], function(require, exports, PayPeriods, ko, _, moment) {
    var BudgetViewModel = (function () {
        function BudgetViewModel() {
            var _this = this;
            this.pageLoaded = false;
            this.currentPayPeriodStart = ko.observable();
            this.currentPayPeriodEnd = ko.observable();
            this.nextPayPeriodStart = ko.observable();
            this.nextPayPeriodEnd = ko.observable();
            this.afterPayDate = ko.observable();
            this.newDay = ko.observable();
            this.newFor = ko.observable();
            this.newAmount = ko.observable();
            this.startingAmount = ko.observable();
            this.paycheckAmount = ko.observable();
            this.dataToLoad = ko.observable();
            this.shareBoxVisible = ko.observable(false);
            this.loadBoxVisible = ko.observable(false);
            this.newEstimateFor = ko.observable();
            this.newEstimateAmount = ko.observable();
            this.newEstimateExpenseAmount = ko.observable();
            this.currentPeriod = ko.observableArray();
            this.nextPeriod = ko.observableArray();
            this.afterPeriod = ko.observableArray();
            this.offTheBooks = ko.observableArray();
            this.estimates = ko.observableArray();
            this.sortPeriods = function () {
                var _this = this;
                this.currentPeriod.sort(function (left, right) {
                    return _this.currentRange.indexOf(left.day()) > _this.currentRange.indexOf(right.day()) ? 1 : -1;
                });

                this.nextPeriod.sort(function (left, right) {
                    return _this.nextRange.indexOf(left.day()) > _this.nextRange.indexOf(right.day()) ? 1 : -1;
                });

                this.afterPeriod.sort(function (left, right) {
                    return _this.afterRange.indexOf(left.day()) > _this.afterRange.indexOf(right.day()) ? 1 : -1;
                });
            };
            this.addTxTo = function (transaction, day) {
                if (this.currentRange.indexOf(day) > -1) {
                    this.currentPeriod.push(transaction);
                } else if (this.nextRange.indexOf(day) > -1) {
                    this.nextPeriod.push(transaction);
                } else {
                    this.afterPeriod.push(transaction);
                }
            };
            this.newTransaction = function (tx) {
                var _this = this;
                var transaction = { day: ko.observable(tx.day), forAmount: ko.observable(tx.forAmount), amount: ko.observable(tx.amount) };
                var oldValue;
                transaction.day.subscribe(function (_old) {
                    oldValue = parseInt(_old(), 10);
                }, transaction, 'beforeChange');

                transaction.day.subscribe(function (_new) {
                    var newValue = parseInt(_new(), 10);
                    if (oldValue !== newValue) {
                        if (_this.currentRange.indexOf(oldValue) > -1) {
                            _this.currentPeriod.remove(transaction);
                        } else if (_this.nextRange.indexOf(oldValue) > -1) {
                            _this.nextPeriod.remove(transaction);
                        } else {
                            _this.afterPeriod.remove(transaction);
                        }
                        _this.addTxTo(transaction, newValue);
                        _this.sortPeriods();
                    }
                });

                this.addTxTo(transaction, tx.day);
                this.sortPeriods();
            };
            this.showOffTheBooks = ko.computed(function () {
                return _this.offTheBooks().length > 0;
            });
            this.showShareBox = function () {
                _this.shareBoxVisible(!_this.shareBoxVisible());
                _this.loadBoxVisible(false);
            };
            this.showLoadBox = function () {
                _this.loadBoxVisible(!_this.loadBoxVisible());
                _this.shareBoxVisible(false);
            };
            this.currentPeriodSubTotal = ko.computed(function () {
                return { amount: parseFloat(_this.startingAmount()) - _this.getTotal(_this.currentPeriod()) };
            });
            this.currentPeriodDetails = ko.computed(function () {
                return { amount: parseFloat(_this.startingAmount()) - _this.getTotal(_this.currentPeriod()) - _this.getTotal(_this.estimates()) };
            });
            this.nextPeriodDetails = ko.computed(function () {
                return { amount: parseFloat(_this.paycheckAmount()) + _this.currentPeriodDetails().amount - _this.getTotal(_this.nextPeriod()) };
            });
            this.nextPeriodStarting = ko.computed(function () {
                return (parseFloat(_this.paycheckAmount()) + _this.currentPeriodDetails().amount).toFixed(2);
            });
            this.afterPeriodDetails = ko.computed(function () {
                return { amount: parseFloat(_this.paycheckAmount()) + _this.nextPeriodDetails().amount - _this.getTotal(_this.afterPeriod()) };
            });
            this.afterPeriodStarting = ko.computed(function () {
                return (parseFloat(_this.paycheckAmount()) + _this.nextPeriodDetails().amount).toFixed(2);
            });
            this.data = ko.computed(function () {
                var transactions = [];
                _.each(_this.currentPeriod(), function (t) {
                    transactions.push(t);
                });
                _.each(_this.nextPeriod(), function (t) {
                    transactions.push(t);
                });
                _.each(_this.afterPeriod(), function (t) {
                    transactions.push(t);
                });
                var estimates = [];
                _.each(_this.estimates(), function (g) {
                    var expenses = [];
                    _.each(g.expenses(), function (tx) {
                        expenses.push({ amount: tx.amount });
                    });
                    estimates.push({ forAmount: g.forAmount, amount: g.amount, expenses: expenses });
                });

                var data = ko.toJSON({ startingAmount: _this.startingAmount, paycheckAmount: _this.paycheckAmount, transactions: transactions, offTheBooks: _this.offTheBooks(), estimates: estimates });
                if (_this.pageLoaded) {
                    localStorage.setItem('data', data); // otherwise update will occur overrided item on load
                }
                return data;
            });
            this.loadData = ko.computed(function () {
                if (_this.dataToLoad()) {
                    localStorage.setItem('data', _this.dataToLoad());
                    _this.load();
                }
            });
            this.addEstimateExpense = function (estimate) {
                var expense = { amount: ko.observable(_this.newEstimateExpenseAmount()), dateEntered: moment() };
                estimate.expenses.push(expense);
                _this.checkEstimateTotal(estimate);
                _this.newEstimateExpenseAmount('');
            };
            this.removeEstimateExpense = function () {
                this.estimate.expenses.remove(this.expense);
            };
            this.addEstimate = function () {
                this.newEstimate({ forAmount: this.newEstimateFor(), amount: this.newEstimateAmount() });
            };
            this.removeEstimate = function (estimate) {
                _this.estimates.remove(estimate);
            };
            this.addTransaction = function () {
                var day = parseInt(this.newDay(), 10);
                this.newTransaction({ day: day, forAmount: this.newFor(), amount: this.newAmount() });
                this.newDay();
                this.newAmount('');
                this.newFor('');
            };
            this.removeTransaction = function (transaction) {
                this.offTheBooks.remove(transaction);
            };
            this.reAddTransaction = function (transaction) {
                this.offTheBooks.remove(transaction);
                this.addTransaction(ko.toJS(transaction));
            };
            this.markTransactionPaid = function (transaction) {
                this.currentPeriod.remove(transaction);
                this.nextPeriod.remove(transaction);
                this.afterPeriod.remove(transaction);
                this.offTheBooks.push(transaction);
            };
            this.activate = function () {
                var payDates = new PayPeriods.BiWeeklyPayDateCalculator().getPayDates();
                var payPeriods = new PayPeriods.BiWeeklyPayPeriodCalculator().getPayPeriods(payDates);

                this.currentRange = payPeriods[0];
                this.nextRange = payPeriods[1];
                this.afterRange = payPeriods[2];

                this.currentPayPeriodStart(payDates[0].format('M/D/YYYY'));
                this.nextPayPeriodStart(payDates[1].format('M/D/YYYY'));
                this.currentPayPeriodEnd(payDates[1].subtract('days', 1).format('M/D/YYYY'));
                this.afterPayDate(payDates[2].format('M/D/YYYY'));
                this.nextPayPeriodEnd(payDates[2].subtract('days', 1).format('M/D/YYYY'));

                this.load();
            };
        }
        BudgetViewModel.prototype.checkEstimateTotal = function (estimate) {
            if (estimate.total() > parseFloat(estimate.amount())) {
                estimate.amount(estimate.total().toFixed(2)); // right now just increase the estimate
            }
        };

        BudgetViewModel.prototype.newEstimateExpense = function (estimate, expense) {
            var amount = ko.observable(expense.amount());
            estimate.expenses.push({ amount: amount, dateEntered: moment() });
            amount.subscribe(function (newValue) {
                this.checkEstimateTotal(estimate);
            });
        };

        BudgetViewModel.prototype.newEstimate = function (estimate) {
            var _this = this;
            var g = {
                forAmount: ko.observable(estimate.forAmount),
                amount: ko.observable(estimate.amount),
                expenses: ko.observableArray(),
                total: null,
                amountLeft: null
            };

            g.total = ko.computed(function () {
                return _this.getTotal(g.expenses());
            });
            g.amountLeft = ko.computed(function () {
                return parseFloat(g.amount()) - _this.getTotal(g.expenses());
            });

            this.estimates.push(g);
            return g;
        };

        BudgetViewModel.prototype.load = function () {
            var _this = this;
            try  {
                if (localStorage.getItem('data')) {
                    var data = JSON.parse(localStorage.getItem('data'));
                    this.startingAmount(data.startingAmount);
                    this.paycheckAmount(data.paycheckAmount);
                    this.currentPeriod([]);
                    this.nextPeriod([]);
                    this.afterPeriod([]);
                    _.each(data.transactions, function (t) {
                        _this.newTransaction(t);
                    });
                    _.each(data.offTheBooks, function (t) {
                        _this.offTheBooks.push(t);
                    });
                    _.each(data.estimates, function (g) {
                        var estimate = _this.newEstimate(g);
                        if (g.expenses) {
                            _.each(g.expenses, function (tx) {
                                tx.amount = ko.observable(tx.amount);
                                _this.newEstimateExpense(estimate, tx);
                            });
                        }
                    });
                }
            } catch (e) {
                localStorage.removeItem('data');
                throw e;
            }
            this.pageLoaded = true;
        };

        BudgetViewModel.prototype.getTotal = function (ts) {
            var total = 0;
            _.each(ts, function (transaction) {
                total += parseFloat(transaction.amount().toString());
            });
            return total;
        };
        return BudgetViewModel;
    })();
    return new BudgetViewModel();
});
//# sourceMappingURL=dashboard.js.map
