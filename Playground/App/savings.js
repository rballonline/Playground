define(["require", "exports", 'modules/payPeriods', 'knockout', 'lodash'], function(require, exports, PayPeriods, ko, _) {
    var Goal = (function () {
        function Goal(goalFor, amount) {
            var _this = this;
            this.goalFor = ko.observable();
            this.amount = ko.observable();
            this.currentSavings = ko.observable();
            this.contributing = ko.observable();
            this.periods = ko.computed(function () {
                var i = 0;
                var balance = parseFloat(_this.currentSavings());

                if (_this.contributing && parseFloat(_this.contributing()) > 0) {
                    while (balance < parseFloat(_this.amount())) {
                        balance += parseFloat(_this.contributing());
                        i++;
                    }
                    return i + ' period' + (i > 1 ? 's' : '');
                }
                return 'infinite periods';
            });
            this.goalFor(goalFor);
            this.amount(amount);
            this.currentSavings('0');
            this.contributing('0');
        }
        Goal.prototype.balance = function () {
            return parseFloat(this.currentSavings()) + parseFloat(this.contributing());
        };
        return Goal;
    })();

    var SavingsViewModel = (function () {
        function SavingsViewModel() {
            var _this = this;
            this.pageLoaded = false;
            this.budgetNotComplete = false;
            this.amount = 0;
            this.goals = ko.observableArray();
            this.newGoalFor = ko.observable();
            this.newAmount = ko.observable();
            this.savings = ko.computed(function () {
                var g = [];
                _.each(_this.goals(), function (goal) {
                    var dummy = goal.amount() + goal.contributing() + goal.currentSavings() + goal.goalFor();
                    g.push(goal);
                });

                var savings = ko.toJSON({ goals: g });
                if (_this.pageLoaded) {
                    localStorage.setItem('savings', savings);
                }
                return savings;
            });
            this.addGoal = function () {
                var newGoal = new Goal(_this.newGoalFor(), _this.newAmount());
                _this.goals.push(newGoal);
            };
            this.removeGoal = function (goal) {
                _this.goals.remove(goal);
            };
            this.loadSavings = function () {
                if (localStorage.getItem('savings')) {
                    var savings = JSON.parse(localStorage.getItem('savings'));
                    _.each(savings.goals, function (goal) {
                        _this.goals.push(new Goal(goal.goalFor, goal.amount));
                    });
                }
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

                _this.loadSavings();
                _this.pageLoaded = true;
            };
        }
        SavingsViewModel.prototype.addToCurrentSavings = function (goal) {
            goal.currentSavings((parseFloat(goal.currentSavings()) + parseFloat(goal.contributing())).toFixed(2));
        };
        return SavingsViewModel;
    })();
    return new SavingsViewModel();
});
//# sourceMappingURL=savings.js.map
