import payPeriods = require('../modules/payPeriods'); // Need to use modules/pay_periods for all aliases
import _ = require('lodash');

export interface Budget {
    getEndingBalance(period: number);
    getStartingBalance(period: number);
    getTransactions(period: number);
}

export interface CanTotal {
    amount: number;
}

export interface HasId {
    id: string;
}

export class Transaction implements CanTotal, HasId {
    day: number;
    isFor: string;
    amount: number;
    id: string;

    constructor(day: number, isFor: string, amount: number) {
        this.day = day;
        this.isFor = isFor;
        this.amount = amount;
        this.id = guid();
    }
}

export class Expense implements CanTotal, HasId {
    date: Moment;
    amount: number;
    id: string;

    constructor(amount) {
        this.amount = amount;
        this.id = guid();
        this.date = moment();
    }
}

export class Estimate implements CanTotal, HasId {
    name: string;
    expenses: Array<Expense>;
    amount: number;
    spent = () => { return total(this.expenses); }
    amountLeft = () => {
        return this.amount - this.spent();
    }
    id: string;

    constructor(name: string, amount: number) {
        this.name = name;
        this.amount = amount;
        this.id = guid();
    }
}

export class Estimates {
    estimates: Array<Estimate> = [];
    total = () => { return total(this.estimates) };
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

export class BiWeeklyBudget implements Budget {
    private _estimates = new Estimates();
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
            amplify.publish('starting-amount-updated');
        });
        amplify.subscribe('updating-paycheck-amount', (newValue) => {
            this._payCheckAmount = parseFloat(newValue);
            this.save();
            amplify.publish('paycheck-amount-updated');
        });

        amplify.subscribe('updating-transaction', (transaction: Transaction) => {
            var period = this.getPeriod(transaction);
            var existing = _.find(period.transactions, (t: Transaction) => {
                return t.id == transaction.id;
            });

            if (existing) {
                existing = transaction;
            }
            else {
                period.transactions.push(transaction);
            }
            period.sort();
            this.save();
            amplify.publish('transaction-updated', period);
        });

        amplify.subscribe('moving-transaction', (id: string) => {
            var transaction = this.getTransaction(id);
            var period = this.getPeriod(transaction);
            var removed = _.remove<Transaction>(period.transactions, (t) => {
                return transaction.id == t.id;
            });

            this._offTheBooks.push(_.first(removed));
            amplify.publish('transaction-moved', transaction);
        });
    }

    private save() {
        var transactions = [];
        _.each(this._firstPeriod.transactions, function (t) { transactions.push(t); });
        _.each(this._secondPeriod.transactions, function (t) { transactions.push(t); });
        _.each(this._thirdPeriod.transactions, function (t) { transactions.push(t); });

        amplify.store('data', JSON.stringify({ startingAmount: this._startingAmount, payCheckAmount: this._payCheckAmount, transactions: transactions, offTheBooks: this._offTheBooks, estimates: this._estimates.estimates }));
    }

    load() {
        try {
            if (amplify.store('data')) {
                var data = JSON.parse(amplify.store('data'));
                this._startingAmount = data.startingAmount;
                this._payCheckAmount =data.payCheckAmount;
                this._firstPeriod.transactions = [];
                this._secondPeriod.transactions = [];
                this._thirdPeriod.transactions = [];

                _.each(data.transactions, (t: Transaction) => {
                    amplify.publish('updating-transaction', t);
                });
                _.each(data.offTheBooks, (t: Transaction) => {
                    this._offTheBooks.push(t);
                });
                _.each(data.estimates, (e: Estimate) => {
                    this._estimates.estimates.push(e);
                });
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

    getEstimates() {
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

    manageEstimate(estimate: Estimate) {
        var estimateToUpdate = _.find(this._estimates.estimates, (e: Estimate) => {
            return e.id = estimate.id;
        });

        if (estimateToUpdate) {
            estimateToUpdate = estimate;
        }
        else {
            this._estimates.estimates.push(estimate);
        }
        amplify.publish('estimate-updated', estimateToUpdate);
    }

    manageExpense(estimate: Estimate, amount: number) {
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