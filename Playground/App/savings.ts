import PayPeriods = require('modules/payPeriods');
import ko = require('knockout');
import _ = require('lodash');

interface IGoal {
    goalFor: string;
    amount: string;
    currentSavings: string;
    contributing: string;
    periods(): string;
    balance(): number;
}

class Goal implements IGoal {
    goalFor: string;
    amount: string;
    currentSavings = '';
    contributing = '';

    constructor(goalFor: string, amount: string) {
        this.goalFor = goalFor;
        this.amount = amount;
        this.currentSavings = '0';
        this.contributing = '0';
    }

    periods = () => {
        var i = 0;
        var balance = parseFloat(this.currentSavings);

        if (this.contributing && parseFloat(this.contributing) > 0) {
            while (balance < parseFloat(this.amount)) {
                balance += parseFloat(this.contributing);
                i++;
            }
            return i + ' period' + (i > 1 ? 's' : '');
        }
        return 'infinite periods';
    }

    balance() {
        return parseFloat(this.currentSavings) + parseFloat(this.contributing);
    }

    addToCurrentSavings() {
        this.currentSavings = (parseFloat(this.currentSavings) + parseFloat(this.contributing)).toFixed(2);
    }
}

class SavingsViewModel {
    budgetNotComplete = false;
    amount = 0;
    goals = [];
    newGoalFor = '';
    newAmount = '';

    addGoal = () => {
        var newGoal = new Goal(this.newGoalFor, this.newAmount);
        this.goals.push(newGoal);
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
    }

}
return new SavingsViewModel();