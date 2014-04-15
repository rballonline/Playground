define(["require", "exports", 'modules/payPeriods', 'lodash'], function(require, exports, PayPeriods, _) {
    var Goal = (function () {
        function Goal(goalFor, amount) {
            var _this = this;
            this.currentSavings = '';
            this.contributing = '';
            this.periods = function () {
                var i = 0;
                var balance = parseFloat(_this.currentSavings);

                if (_this.contributing && parseFloat(_this.contributing) > 0) {
                    while (balance < parseFloat(_this.amount)) {
                        balance += parseFloat(_this.contributing);
                        i++;
                    }
                    return i + ' period' + (i > 1 ? 's' : '');
                }
                return 'infinite periods';
            };
            this.goalFor = goalFor;
            this.amount = amount;
            this.currentSavings = '0';
            this.contributing = '0';
        }
        Goal.prototype.balance = function () {
            return parseFloat(this.currentSavings) + parseFloat(this.contributing);
        };

        Goal.prototype.addToCurrentSavings = function () {
            this.currentSavings = (parseFloat(this.currentSavings) + parseFloat(this.contributing)).toFixed(2);
        };
        return Goal;
    })();

    var SavingsViewModel = (function () {
        function SavingsViewModel() {
            var _this = this;
            this.budgetNotComplete = false;
            this.amount = 0;
            this.goals = [];
            this.newGoalFor = '';
            this.newAmount = '';
            this.addGoal = function () {
                var newGoal = new Goal(_this.newGoalFor, _this.newAmount);
                _this.goals.push(newGoal);
            };
            this.activate = function () {
                if (localStorage.getItem('data')) {
                    _this.budgetNotComplete = false;

                    var data = JSON.parse(localStorage.getItem('data'));
                    if (!data && !data.StartingAmount) {
                        _this.budgetNotComplete = true;
                        return;
                    }
                    _this.amount = parseFloat(data.startingAmount);

                    var payPeriods = new PayPeriods.BiWeeklyPayPeriodCalculator().getPayPeriods(new PayPeriods.BiWeeklyPayDateCalculator().getPayDates());

                    _.each(data.transactions, function (transaction) {
                        if (payPeriods[0].indexOf(transaction.day) > -1) {
                            _this.amount -= transaction.amount;
                        }
                    });

                    _.each(data.estimates, function (estimate) {
                        _this.amount -= estimate.amount;
                    });
                } else {
                    _this.budgetNotComplete = true;
                }
            };
        }
        return SavingsViewModel;
    })();
    return new SavingsViewModel();
});
//# sourceMappingURL=savings.js.map
