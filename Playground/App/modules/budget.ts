import payPeriods = require('modules/payPeriods');
import _ = require('lodash');

export interface Budget {
}

export interface CanTotal {
    amount: number;
}

export interface Transaction extends CanTotal {
    day: number;
    isFor: string;
}

export interface Expense extends CanTotal {
    date: Moment;
}

export class Estimate implements CanTotal {
    name: string;
    expenses: Array<Expense>;
    amount: number;
    spent = total(this.expenses);
}

function total(values: Array<CanTotal>) {
    var total = 0;
    for(var i = 0; i < values.length; i++) {
        total += values[i].amount;
    }
    return total;
}

export class Estimates {
    estimates: Array<Estimate> = [];
    total = total(this.estimates);
}

export class Period {
    transactions: Array<Transaction> = [];
    total = total(this.transactions);
}

export class BiWeeklyBudget implements Budget {
    private Estimates = new Estimates();
    private startingAmount = 0;
    private payCheckAmount = 0;
    private firstPeriod = new Period();
    private secondPeriod = new Period();
    private thirdPeriod = new Period();
    private periods : Array<Array<number>> = [];

    constructor(firstPayDate?: string) {
        var biWeeklyPayDateCalculator = new payPeriods.BiWeeklyPayDateCalculator();
        var payDates = biWeeklyPayDateCalculator.getPayDates(firstPayDate);        
        var biWeeklyPayPeriodCalculator = new payPeriods.BiWeeklyPayPeriodCalculator();
        this.periods = biWeeklyPayPeriodCalculator.getPayPeriods(payDates);
    }
    
    setStartingAmount(amount: number) { this.startingAmount = amount; }
    setPayCheckAmount(amount: number) { this.payCheckAmount = amount; }

    getEndingBalance(period: number) {
        if(period == 1) {
            return this.startingAmount - this.firstPeriod.total - this.Estimates.total;
        }
        else if(period == 2) {
            return this.getEndingBalance(1) + this.payCheckAmount - this.secondPeriod.total;
        }
        else if(period == 3) {
            return this.getEndingBalance(2) + this.payCheckAmount - this.thirdPeriod.total;
        }
        throw 'Invalid period, must be less than 4, was ' + period;
    }

    getStartingBalance(period: number) {
        if(period == 2){
            return this.getEndingBalance(1) + this.payCheckAmount;
        }
        else if(period == 3) {
            return this.getEndingBalance(2) + this.payCheckAmount;
        }
        throw 'Invalid period, must be either 2 or 3 given ' + period;
    }

    modifyTransaction(index: number, transaction: Transaction) {
        if (_.contains(this.periods[0], transaction.day)) {
            this.firstPeriod.transactions[index] = transaction;
        }
        else if (_.contains(this.periods[1], transaction.day)) {
            this.secondPeriod.transactions[index] = transaction;
        }
        else {
            this.thirdPeriod.transactions[index] = transaction;
        }
    }

    addTransaction(transaction: Transaction) {
        if (_.contains(this.periods[0], transaction.day)) {
            this.firstPeriod.transactions.push(transaction);
        }
        else if (_.contains(this.periods[1], transaction.day)) {
            this.secondPeriod.transactions.push(transaction);
        }
        else {
            this.thirdPeriod.transactions.push(transaction);
        }
    }

    modifyEstimate(index: number, estimate: Estimate) {
        this.Estimates[index] = estimate;;
    }

    addEstimate(estimate: Estimate) {
        this.Estimates.estimates.push(estimate);
    }
}