import payPeriods = require('../modules/payPeriods'); // Need to use modules/payPeriods for all aliases
import _ = require('lodash');

export interface Budget {
    setStartingAmount(amount: number);
    setPayCheckAmount(amount: number);
    getEndingBalance(period: number);
    getStartingBalance(period: number);
    modifyTransaction(index: number, transaction: Transaction);
    addTransaction(transaction: Transaction);
    modifyEstimate(index: number, estimate: Estimate);
    addEstimate(estimate: Estimate);
}

export interface CanTotal {
    amount: number;
}

export class Transaction implements CanTotal {
    day: number;
    isFor: string;
    amount: number;

    constructor(day: number, isFor: string, amount: number) {
        this.day = day;
        this.isFor = isFor;
        this.amount = amount;
    }
}

export class Expense implements CanTotal {
    date: Moment;
    amount: number;
}

export class Estimate implements CanTotal {
    name: string;
    expenses: Array<Expense>;
    amount: number;
    spent = () => { return total(this.expenses); }

    constructor(name: string, amount: number) {
        this.name = name;
        this.amount = amount;
    }
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
    total = () => { return total(this.estimates) };
}

export class Period {
    transactions: Array<Transaction> = [];
    total = () => { return total(this.transactions) };
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
            return this.startingAmount - this.firstPeriod.total() - this.Estimates.total();
        }
        else if(period == 2) {
            return this.getEndingBalance(1) + this.payCheckAmount - this.secondPeriod.total();
        }
        else if(period == 3) {
            return this.getEndingBalance(2) + this.payCheckAmount - this.thirdPeriod.total();
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
        this.Estimates[index] = estimate;
    }

    addEstimate(estimate: Estimate) {
        this.Estimates.estimates.push(estimate);
    }
}