define(["require", "exports", 'modules/budget', 'knockout', 'lodash'], function(require, exports, Budget, ko, _) {
    var budget = new Budget.BiWeeklyBudget();

    //TODO: Expenses are not adding
    var TransactionViewModel = (function () {
        function TransactionViewModel(t) {
            this.forAmount = ko.observable();
            this.amount = ko.observable();
            this.day = ko.observable();
            this.id = t.id;
            this.forAmount(t.forAmount);
            this.amount(t.amount.toFixed(2));
            this.day(t.day.toString());

            this.forAmount.subscribe(function (newValue) {
                amplify.publish('updating-transaction-is-for', t, newValue);
            });

            this.amount.subscribe(function (newValue) {
                amplify.publish('updating-transaction-amount', t, newValue);
            });

            this.day.subscribe(function (newValue) {
                amplify.publish('updating-transaction-day', t, newValue);
            });
        }
        return TransactionViewModel;
    })();

    var ExpenseViewModel = (function () {
        function ExpenseViewModel(expense) {
            this.amount = ko.observable();
            this.id = expense.id;
            this.parentId = expense.parentId;
            this.dateEntered = expense.dateEntered;
            this.amount(expense.amount.toFixed(2));

            this.amount.subscribe(function (value) {
                budget.updateExpenseAmount(expense, value);
            });
        }
        return ExpenseViewModel;
    })();

    var EstimateViewModel = (function () {
        function EstimateViewModel(estimate) {
            var _this = this;
            this.forAmount = ko.observable();
            this.amount = ko.observable();
            this.amountLeft = ko.observable();
            this.total = ko.observable();
            this.expenses = ko.observableArray();
            this.newExpenseAmount = ko.observable();
            this.id = estimate.id;
            this.forAmount(estimate.forAmount);
            this.amount(estimate.amount.toFixed(2));
            this.amountLeft(estimate.amountLeft().toFixed(2));
            this.total(estimate.total().toFixed(2));

            this.amount.subscribe(function (value) {
                budget.updateEstimateAmount(estimate, value);
            });

            this.forAmount.subscribe(function (value) {
                budget.udpateEstimateFor(estimate, value);
            });

            _.each(estimate.expenses, function (expense) {
                _this.expenses.push(new ExpenseViewModel(expense));
            });
        }
        return EstimateViewModel;
    })();

    var BudgetViewModel = (function () {
        function BudgetViewModel() {
            var _this = this;
            this.pageLoaded = false;
            this.firstPayPeriodStart = ko.observable();
            this.firstPayPeriodEnd = ko.observable();
            this.secondPayPeriodStart = ko.observable();
            this.secondPayPeriodEnd = ko.observable();
            this.thirdPayDate = ko.observable();
            this.newDay = ko.observable();
            this.newFor = ko.observable();
            this.newAmount = ko.observable();
            this.startingAmount = ko.observable();
            this.paycheckAmount = ko.observable();
            this.newEstimateFor = ko.observable();
            this.newEstimateAmount = ko.observable();
            this.firstPeriodSubTotal = ko.observable();
            this.firstPeriodEnding = ko.observable();
            this.secondPeriodStarting = ko.observable();
            this.secondPeriodEnding = ko.observable();
            this.thirdPeriodStarting = ko.observable();
            this.thirdPeriodEnding = ko.observable();
            this.firstPeriod = ko.observableArray();
            this.secondPeriod = ko.observableArray();
            this.thirdPeriod = ko.observableArray();
            this.offTheBooks = ko.observableArray();
            this.estimates = ko.observableArray();
            this.showOffTheBooks = ko.computed(function () {
                return _this.offTheBooks().length > 0;
            });
            this.activate = function () {
                budget.load();

                var payDates = budget.payDates;
                _this.firstPayPeriodStart(payDates[0].format('MM/DD/YYYY'));
                _this.firstPayPeriodEnd(payDates[1].subtract('d', 1).format('MM/DD/YYYY'));
                _this.secondPayPeriodStart(payDates[1].add('d', 1).format('MM/DD/YYYY'));
                _this.secondPayPeriodEnd(payDates[2].subtract('d', 1).format('MM/DD/YYYY'));
                _this.thirdPayDate(payDates[2].add('d', 1).format('MM/DD/YYYY'));
                _this.startingAmount(budget.getStartingAmount().toFixed(2));
                _this.paycheckAmount(budget.getPaycheckAmount().toFixed(2));
            };
            // Starting amount
            amplify.subscribe('update-starting-amount', function (newValue) {
                _this.startingAmount(newValue);
            });
            this.startingAmount.subscribe(function (newValue) {
                amplify.publish('updating-starting-amount', newValue);
            });

            // Paycheck amount
            amplify.subscribe('update-paycheck-amount', function (newValue) {
                _this.paycheckAmount(newValue);
            });
            this.paycheckAmount.subscribe(function (newValue) {
                amplify.publish('updating-paycheck-amount', newValue);
            });

            amplify.subscribe('update-estimate', function (estimate) {
                var estimateVm = _.find(_this.estimates(), function (e) {
                    return estimate.id == e.id;
                });
                estimateVm = new EstimateViewModel(estimate);
            });

            amplify.subscribe('add-expense', function (estimate, expense) {
                var estimateVm = _.find(_this.estimates(), function (e) {
                    return expense.parentId == e.id;
                });
                estimateVm.expenses.push(new ExpenseViewModel(expense));
                updateEstimateValues(estimateVm, estimate);
            });

            amplify.subscribe('remove-expense', function (estimate, expenseId) {
                var estimateVm = _.find(_this.estimates(), function (e) {
                    return estimate.id == e.id;
                });
                estimateVm.expenses.remove(function (expense) {
                    return expense.id == expenseId;
                });
                updateEstimateValues(estimateVm, estimate);
            });

            amplify.subscribe('modified-expense', function (estimate, expense) {
                var estimateVm = _.find(_this.estimates(), function (e) {
                    return expense.parentId == e.id;
                });
                updateEstimateValues(estimateVm, estimate);
            });

            function updateEstimateValues(estimateVm, estimate) {
                estimateVm.amountLeft(estimate.amountLeft().toFixed(2));
                estimateVm.total(estimate.total().toFixed(2));
            }

            amplify.subscribe('update-estimates', function () {
                _this.updateEstimates();
            });
            amplify.subscribe('update-totals', function () {
                _this.updateTotals();
            });
            amplify.subscribe('update-periods', function () {
                _this.updatePeriods();
            });
            amplify.subscribe('update-all', function () {
                _this.updateAll();
            });
        }
        BudgetViewModel.prototype.addTransaction = function () {
            budget.addTransaction(new Budget.Transaction(parseInt(this.newDay(), 10), this.newFor(), parseFloat(this.newAmount())));
        };

        BudgetViewModel.prototype.addEstimate = function () {
            var estimate = new Budget.Estimate(this.newEstimateFor(), parseFloat(this.newEstimateAmount()));
            budget.addEstimate(estimate);
        };

        BudgetViewModel.prototype.addExpense = function (estimate) {
            budget.addExpense(estimate.id, estimate.newExpenseAmount());
            estimate.newExpenseAmount('');
        };

        BudgetViewModel.prototype.moveTransaction = function (transaction) {
            budget.moveTransaction(transaction.id);
        };

        BudgetViewModel.prototype.removeEstimate = function (estimate) {
            budget.removeEstimate(estimate.id);
        };

        BudgetViewModel.prototype.removeExpense = function (expense) {
            budget.removeExpense(expense.parentId, expense.id);
        };

        BudgetViewModel.prototype.reAddTransaction = function (transaction) {
            budget.reAddTransaction(transaction.id);
        };

        BudgetViewModel.prototype.update = function (period, num) {
            period.removeAll();
            _.each(budget.getTransactions(num), function (transaction) {
                period.push(new TransactionViewModel(transaction));
            });
        };

        BudgetViewModel.prototype.updateAll = function () {
            this.updateOffTheBooks();
            this.updateEstimates();
            this.updatePeriods();
        };

        BudgetViewModel.prototype.updatePeriods = function () {
            this.update(this.firstPeriod, 1);
            this.update(this.secondPeriod, 2);
            this.update(this.thirdPeriod, 3);
            this.updateTotals();
        };

        BudgetViewModel.prototype.updateOffTheBooks = function () {
            this.offTheBooks(budget.getOffTheBooks());
        };

        BudgetViewModel.prototype.updateEstimates = function () {
            var _this = this;
            this.estimates.removeAll();
            _.each(budget.getEstimates(), function (estimate) {
                _this.estimates.push(new EstimateViewModel(estimate));
            });
            this.updateTotals();
        };

        BudgetViewModel.prototype.updateTotals = function () {
            this.firstPeriodSubTotal(budget.getEndingBalance(0).toFixed(2));
            this.firstPeriodEnding(budget.getEndingBalance(1).toFixed(2));
            this.secondPeriodStarting(budget.getStartingBalance(2).toFixed(2));
            this.secondPeriodEnding(budget.getEndingBalance(2).toFixed(2));
            this.thirdPeriodStarting(budget.getStartingBalance(3).toFixed(2));
            this.thirdPeriodEnding(budget.getEndingBalance(3).toFixed(2));
        };
        return BudgetViewModel;
    })();
    return new BudgetViewModel();
});
//# sourceMappingURL=dashboard.js.map
