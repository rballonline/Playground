import PayPeriods = require('modules/payPeriods');
import ko = require('knockout');
import _ = require('lodash');

class Goal {
    goalFor = ko.observable<string>();
    amount = ko.observable<string>();
    currentSavings = ko.observable<string>();
    contributing = ko.observable<string>();

    constructor(goalFor: string, amount: string) {
        this.goalFor(goalFor);
        this.amount(amount);
        this.currentSavings('0');
        this.contributing('0');
    }

    periods = ko.computed<string>(() => {
        var i = 0;
        var balance = parseFloat(this.currentSavings());

        if (this.contributing && parseFloat(this.contributing()) > 0) {
            while (balance < parseFloat(this.amount())) {
                balance += parseFloat(this.contributing());
                i++;
            }
            return i + ' period' + (i > 1 ? 's' : '');
        }
        return 'infinite periods';
    });

    balance = ko.computed<number>(() => {
        return parseFloat(this.currentSavings()) + parseFloat(this.contributing());
    });
}

class SavingsViewModel {
    private pageLoaded = false;

    budgetNotComplete = false;
    amount = 0;
    goals = ko.observableArray<Goal>();
    newGoalFor = ko.observable<string>();
    newAmount = ko.observable<string>();

   savings = ko.computed(() => {
        var g = [];
       _.each(this.goals(), (goal) => {
           var dummy = goal.periods() + goal.goalFor();
           g.push(goal);
        });

        var savings = ko.toJSON({ goals: g });
        if (this.pageLoaded) { // otherwise update will occur overrided item on load
            localStorage.setItem('savings', savings);
        }
        return savings;
    });

    addGoal = () => {
        var newGoal = new Goal(this.newGoalFor(), this.newAmount());
        this.goals.push(newGoal);
    };

    removeGoal = (goal) => {
        this.goals.remove(goal);
    };

    addToCurrentSavings(goal : Goal) {
        goal.currentSavings((parseFloat(goal.currentSavings()) + parseFloat(goal.contributing())).toFixed(2));
    }

    loadSavings = () => {
        if (localStorage.getItem('savings')) {
            var savings = JSON.parse(localStorage.getItem('savings'));
            _.each(savings.goals, (goal: any) => {
                var newGoal = new Goal(goal.goalFor, goal.amount);
                newGoal.currentSavings(goal.currentSavings);
                newGoal.contributing(goal.contributing);
                this.goals.push(newGoal);
            });
        }
    };

    activate = () => {
        if (localStorage.getItem('data')) {
            this.budgetNotComplete = false;

            var data = JSON.parse(localStorage.getItem('data'));
            if (!data && !data.StartingAmount) {
                this.budgetNotComplete = true;
                return;
            }
            this.amount = parseFloat(data.startingAmount);

            var payPeriods = new PayPeriods.BiWeeklyPayPeriodCalculator().getPayPeriods(new PayPeriods.BiWeeklyPayDateCalculator().getPayDates());

            _.each(data.transactions, (transaction: any) => {
                if (payPeriods[0].indexOf(transaction.day) > -1) {
                    this.amount -= transaction.amount;
                }
            });

            _.each(data.estimates, (estimate: any) => {
                this.amount -= estimate.amount;
            });
        }
        else {
            this.budgetNotComplete = true;
        }

        this.loadSavings();
        this.pageLoaded = true;
    }

}
return new SavingsViewModel();