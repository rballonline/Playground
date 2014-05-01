define(["require", "exports", 'modules/budget', 'knockout', 'lodash'], function(require, exports, Budget, ko, _) {
    // Convention:
    // add/update -> update UI value
    // add/updat(ing) -> subscribe on observable fires
    // add/updat(ed) -> UI interactions
    var TransactionViewModel = (function () {
        function TransactionViewModel(t) {
            this.forAmount = ko.observable();
            this.amount = ko.observable();
            this.day = ko.observable();
            this.forAmount(t.isFor);
            this.amount(t.amount.toFixed(2));
            this.day(t.day.toFixed(2));

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

    var BudgetViewModel = (function () {
        function BudgetViewModel() {
            var _this = this;
            this.budget = new Budget.BiWeeklyBudget();
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
            this.newEstimateExpenseAmount = ko.observable();
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
                return _this.offTheBooks.length > 0;
            });
            this.activate = function () {
                _this.budget.load();

                var payDates = _this.budget.payDates;
                _this.firstPayPeriodStart(payDates[0].format('MM/DD/YYYY'));
                _this.firstPayPeriodEnd(payDates[1].format('MM/DD/YYYY'));
                _this.secondPayPeriodStart(payDates[1].format('MM/DD/YYYY'));
                _this.secondPayPeriodEnd(payDates[2].format('MM/DD/YYYY'));
                _this.thirdPayDate(payDates[2].format('MM/DD/YYYY'));

                _this.startingAmount(_this.budget.getStartingAmount().toFixed(2));
                _this.paycheckAmount(_this.budget.getPaycheckAmount().toFixed(2));

                _.each(_this.budget.getTransactions(1), function (tx) {
                    _this.firstPeriod.push(new TransactionViewModel(tx));
                });
                _.each(_this.budget.getTransactions(2), function (tx) {
                    _this.secondPeriod.push(new TransactionViewModel(tx));
                });
                _.each(_this.budget.getTransactions(3), function (tx) {
                    _this.thirdPeriod.push(new TransactionViewModel(tx));
                });

                _this.offTheBooks(_this.budget.getOffTheBooks());

                _this.estimates(_this.budget.getEstimates());
            };
            // Starting amount
            amplify.subscribe('update-starting-amount', function (newValue) {
                _this.startingAmount(newValue);
            });
            this.startingAmount.subscribe(function (newValue) {
                amplify.publish('updating-starting-amount', newValue);
            });
            amplify.subscribe('starting-amount-updated', function () {
                _this.updateTotals();
            });

            // Paycheck amount
            amplify.subscribe('update-paycheck-amount', function (newValue) {
                _this.paycheckAmount(newValue);
            });
            this.paycheckAmount.subscribe(function (newValue) {
                amplify.publish('updating-paycheck-amount', newValue);
            });
            amplify.subscribe('paycheck-amount-updated', function () {
                _this.updateTotals();
            });

            // Transaction
            amplify.subscribe('add-transaction', function () {
            });
            amplify.subscribe('transaction-added', function () {
            });
        }
        BudgetViewModel.prototype.addEstimate = function () {
            this.budget.manageEstimate(new Budget.Estimate(this.newEstimateFor(), parseFloat(this.newEstimateAmount())));
        };

        BudgetViewModel.prototype.addTransaction = function () {
            amplify.publish('adding-transaction', new Budget.Transaction(parseInt(this.newDay(), 10), this.newFor(), parseFloat(this.newAmount())));
        };

        BudgetViewModel.prototype.updateTotals = function () {
            this.firstPeriodSubTotal(this.budget.getEndingBalance(0).toFixed(2));
            this.firstPeriodEnding(this.budget.getEndingBalance(1).toFixed(2));
            this.secondPeriodStarting(this.budget.getStartingBalance(2).toFixed(2));
            this.secondPeriodEnding(this.budget.getEndingBalance(2).toFixed(2));
            this.thirdPeriodStarting(this.budget.getStartingBalance(3).toFixed(2));
            this.thirdPeriodEnding(this.budget.getEndingBalance(3).toFixed(2));
        };
        return BudgetViewModel;
    })();
    return new BudgetViewModel();
});
//# sourceMappingURL=dashboard.js.map
