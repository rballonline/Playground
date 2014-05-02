import payPeriods = require('../modules/payPeriods'); // Need to use modules/pay_periods for all aliases
import _ = require('lodash');

export interface CanTotal {
    amount: number;
}

export interface HasId {
    id: string;
}

export class Transaction implements CanTotal, HasId {
    day: number;
    forAmount: string;
    amount: number;
    id: string;

    constructor(day: number, forAmount: string, amount: number) {
        this.day = day;
        this.forAmount = forAmount;
        this.amount = amount;
        this.id = guid();
    }
}

export class Expense implements CanTotal, HasId {
    dateEntered: string;
    amount: number;
    id: string;
    parentId: string;

    constructor(amount, parentId) {
        this.amount = amount;
        this.parentId = parentId;
        this.id = guid();
        this.dateEntered = moment().format('M/D');
    }
}

export class Estimate implements CanTotal, HasId {
    reallyAnEstimate: string;
    forAmount: string;
    expenses: Array<Expense> = [];
    amount: number;
    id: string;

    total = () => {
        return total(this.expenses);
    }
    amountLeft = () => {
        return this.amount - this.total();
    }

    constructor(forAmount: string, amount: number) {
        this.forAmount = forAmount;
        this.amount = amount;
        this.id = guid();
        this.reallyAnEstimate = 'yeah!';
    }
}

export class Estimates {
    estimates: Array<Estimate> = [];
    total() { return total(this.estimates); }
}

export class Period {
    transactions: Array<Transaction> = [];
    period: number;
    daysInPeriod: Array<number> = [];
    total() { return total(this.transactions) }
    sort() {
        this.transactions = _.sortBy(this.transactions, (transaction: Transaction) => {
            return this.daysInPeriod.indexOf(transaction.day);
        });
    }
    constructor(period: number) {
        this.period = period;
    }
}

export class BiWeeklyBudget {
    private _estimates = new Estimates(); // hmm not sure about this
    private _startingAmount = 0;
    private _payCheckAmount = 0;
    private _firstPeriod = new Period(1);
    private _secondPeriod = new Period(2);
    private _thirdPeriod = new Period(3);
    private _offTheBooks: Array<Transaction> = [];
    private _periods: Array<Array<number>> = [];
    private _payDates: Array<Moment> = [];

    constructor(firstPayDate?: string) {
        var biWeeklyPayDateCalculator = new payPeriods.BiWeeklyPayDateCalculator();
        this._payDates = biWeeklyPayDateCalculator.getPayDates(firstPayDate);        
        var biWeeklyPayPeriodCalculator = new payPeriods.BiWeeklyPayPeriodCalculator();

        var periods = biWeeklyPayPeriodCalculator.getPayPeriods(this._payDates);
        this._firstPeriod.daysInPeriod = periods[0];
        this._secondPeriod.daysInPeriod = periods[1];
        this._thirdPeriod.daysInPeriod = periods[2];

        amplify.subscribe('updating-starting-amount', (newValue) => {
            this._startingAmount = parseFloat(newValue);
            this.save();
            amplify.publish('update-totals');
        });
        amplify.subscribe('updating-paycheck-amount', (newValue) => {
            this._payCheckAmount = parseFloat(newValue);
            this.save();
            amplify.publish('update-totals');
        });

        amplify.subscribe('updating-transaction-is-for', (transaction: Transaction, newValue: string) => {
            transaction.forAmount = newValue;
            this.save();
        });

        amplify.subscribe('updating-transaction-amount', (transaction: Transaction, newValue: string) => {
            transaction.amount = parseFloat(newValue);
            this.save();
            amplify.publish('update-totals');
        });

        amplify.subscribe('updating-transaction-day', (transaction: Transaction, newValue: string) => {
            // This might be easier if we just had one transactions list...
            var period = this.getPeriod(transaction);
            _.remove<Transaction>(period.transactions, (t) => {
                return transaction.id == t.id;
            });
            transaction.day = parseFloat(newValue);
            var newPeriod = this.getPeriod(transaction);
            newPeriod.transactions.push(transaction);
            this.save();
            amplify.publish('update-periods');
        });

        amplify.subscribe('moving-transaction', (id: string) => {
            var transaction = this.getTransaction(id);
            var period = this.getPeriod(transaction);
            var removed = _.remove<Transaction>(period.transactions, (t) => {
                return transaction.id == t.id;
            });

            this._offTheBooks.push(_.first(removed));
            this.save();
            amplify.publish('update-all');
        });
    }

    addTransaction(transaction: Transaction) {
        var period = this.getPeriod(transaction);
        period.transactions.push(transaction);
        period.sort();
        this.save();
        amplify.publish('update-periods', period);
    }

    private save() {
        var transactions = [];
        _.each(this._firstPeriod.transactions, function (t) { transactions.push(t); });
        _.each(this._secondPeriod.transactions, function (t) { transactions.push(t); });
        _.each(this._thirdPeriod.transactions, function (t) { transactions.push(t); });

        amplify.store('data', JSON.stringify({ startingAmount: this._startingAmount, payCheckAmount: this._payCheckAmount, transactions: transactions, offTheBooks: this._offTheBooks, estimates: this._estimates.estimates }));
    }

    load() {
        // NOTE: "new" objects are created because functions on those objects are not stored in json, only properties
        try {
            if (amplify.store('data')) {
                var data = JSON.parse(amplify.store('data'));
                this._startingAmount = data.startingAmount;
                this._payCheckAmount =data.payCheckAmount;
                this._firstPeriod.transactions = [];
                this._secondPeriod.transactions = [];
                this._thirdPeriod.transactions = [];

                _.each(data.transactions, (t: Transaction) => {
                    var period = this.getPeriod(t);
                    period.transactions.push(new Transaction(t.day, t.forAmount, t.amount));
                    period.sort();
                });
                _.each(data.offTheBooks, (t: Transaction) => {
                    this._offTheBooks.push(new Transaction(t.day, t.forAmount, t.amount));
                });
                _.each(data.estimates, (e: Estimate) => {
                    this._estimates.estimates.push(new Estimate(e.forAmount, e.amount));
                });
                amplify.publish('update-all');
            }
        }
        catch (e) {
            localStorage.removeItem('data');
            throw e;
        }
    }

    get payDates() {
        return this._payDates;
    }

    getStartingAmount() {
        return this._startingAmount;
    }

    getPaycheckAmount() {
        return this._payCheckAmount;
    }

    getEndingBalance(period: number) {
        if (period == 0) {
            return this._startingAmount - this._firstPeriod.total();
        }
        if(period == 1) {
            return this._startingAmount - this._firstPeriod.total() - this._estimates.total();
        }
        else if(period == 2) {
            return this.getEndingBalance(1) + this._payCheckAmount - this._secondPeriod.total();
        }
        else if(period == 3) {
            return this.getEndingBalance(2) + this._payCheckAmount - this._thirdPeriod.total();
        }
        throw 'Invalid period, must be less than 4, was ' + period;
    }

    getStartingBalance(period: number) {
        if(period == 2){
            return this.getEndingBalance(1) + this._payCheckAmount;
        }
        else if(period == 3) {
            return this.getEndingBalance(2) + this._payCheckAmount;
        }
        throw 'Invalid period, must be either 2 or 3 given ' + period;
    }
    
    getTransactions(period: number) {
        // might be easier dealing with one list ie (where this.transactions in period 1)
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
    }

    updateExpenseAmount(expense: Expense, value: string) {
        expense.amount = parseFloat(value);
        //amplify.publish('update-estimate');
    }

    updateEstimateAmount(estimate: Estimate, value: string) {
        estimate.amount = parseFloat(value);
        amplify.publish('update-totals');
    }

    udpateEstimateFor(estimate: Estimate, value: string) {
        estimate.forAmount = value;
        this.save();
    }

    private getPeriod(transaction: Transaction) {
        if (_.contains(this._firstPeriod.daysInPeriod, transaction.day)) {
            return this._firstPeriod;
        }
        else if (_.contains(this._secondPeriod.daysInPeriod, transaction.day)) {
            return this._secondPeriod;
        }
        return this._thirdPeriod;
    }

    getOffTheBooks() {
        return this._offTheBooks;
    }

    getEstimates = () => {
        return this._estimates.estimates;
    }

    private getTransaction(id: string) {
        var transaction = _.find<Transaction>(this._firstPeriod.transactions, (t) => { return t.id == id });
        if (transaction)
            return transaction;
        transaction = _.find<Transaction>(this._secondPeriod.transactions, (t) => { return t.id == id });
        if (transaction)
            return transaction;
        transaction = _.find<Transaction>(this._thirdPeriod.transactions, (t) => { return t.id == id });
        if (transaction)
            return transaction;
        
    }

    addEstimate(estimate: Estimate) {
        this._estimates.estimates.push(estimate);
        this.save();
        amplify.publish('update-estimates');
    }

    removeEstimate(id: string) {
        _.remove<Estimate>(this._estimates.estimates, (e) => {
            return e.id == id;
        });
        this.save();
        amplify.publish('update-estimates');
    }

    addExpense(id: string, amount: string) {
        var estimate = _.find<Estimate>(this._estimates.estimates, (estimate) => {
            return estimate.id == id;
        });
        estimate.expenses.push(new Expense(parseFloat(amount), estimate.id));
        this.save();
        amplify.publish('update-estimate', estimate);
    }
}

function guid() {
    var s = [];
    var hexDigits = "0123456789abcdef";
    for (var i = 0; i < 36; i++) {
        s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
    }
    s[14] = "4";  // bits 12-15 of the time_hi_and_version field to 0010
    s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1);  // bits 6-7 of the clock_seq_hi_and_reserved to 01
    s[8] = s[13] = s[18] = s[23] = "-";

    var uuid = s.join("");
    return uuid;
}

function total(values: Array<CanTotal>) {
    var total = 0;
    for (var i = 0; i < values.length; i++) {
        total += values[i].amount;
    }
    return total;
}