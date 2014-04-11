import PayPeriods = require('modules/payPeriods');
import ko = require('knockout');
import _ = require('lodash');
import moment = require('moment');

interface HasAmount {
    amount: KnockoutObservable<string>;
}

interface Transaction extends HasAmount {
    day: KnockoutObservable<string>;
    forAmount: KnockoutObservable<string>;
}

interface EstimateExpense extends HasAmount {
    dateEntered: Moment;
}

interface Estimate extends HasAmount {
    expenses: KnockoutObservableArray<EstimateExpense>;
    total: KnockoutComputed<number>;
    forAmount: KnockoutObservable<string>;
    amountLeft: KnockoutComputed<number>;
}

class BudgetViewModel {
    pageLoaded = false;
    currentPayPeriodStart = ko.observable<string>();
    currentPayPeriodEnd = ko.observable<string>();
    nextPayPeriodStart = ko.observable<string>();
    nextPayPeriodEnd = ko.observable<string>();
    afterPayDate = ko.observable<string>();

	newDay = ko.observable<string>();
	newFor = ko.observable<string>();
	newAmount = ko.observable<string>();
	startingAmount = ko.observable<string>();
	paycheckAmount = ko.observable<string>();
	dataToLoad = ko.observable<string>();
	shareBoxVisible = ko.observable<boolean>(false);
    loadBoxVisible = ko.observable<boolean>(false);
    
	newEstimateFor = ko.observable<string>();
    newEstimateAmount = ko.observable<string>();

	newEstimateExpenseAmount = ko.observable<string>();
	
    currentPeriod = ko.observableArray<Transaction>();
    nextPeriod = ko.observableArray<Transaction>();
    afterPeriod = ko.observableArray<Transaction>();
    offTheBooks = ko.observableArray<Transaction>();

	currentRange: Array <number>;
    nextRange: Array<number>;
    afterRange: Array<number>;

    estimates = ko.observableArray<Estimate>();

    private checkEstimateTotal(estimate: Estimate) {
        if (estimate.total() > parseFloat(estimate.amount())) {
            estimate.amount(estimate.total().toFixed(2)); // right now just increase the estimate
        }
    }

    private newEstimateExpense(estimate: Estimate, expense: EstimateExpense) {
        var amount = ko.observable(expense.amount());
        estimate.expenses.push({ amount: amount, dateEntered: moment() });
        amount.subscribe(function (newValue) {
            this.checkEstimateTotal(estimate);
        });
    }

    private newEstimate(estimate) {
        var g : Estimate = {
            forAmount: ko.observable<string>(estimate.forAmount),
            amount: ko.observable<string>(estimate.amount),
            expenses: ko.observableArray<EstimateExpense>(),
            total: null,
            amountLeft: null
        };

        g.total = ko.computed<number>(() => {
            return this.getTotal(g.expenses());
        });
        g.amountLeft = ko.computed(() => {
            return parseFloat(g.amount()) - this.getTotal(g.expenses());
        });

        this.estimates.push(g);
        return g;
    }

    private load() {
        try {
            if (localStorage.getItem('data')) {
                var data = JSON.parse(localStorage.getItem('data'));
                this.startingAmount(data.startingAmount);
                this.paycheckAmount(data.paycheckAmount);
                this.currentPeriod([]);
                this.nextPeriod([]);
                this.afterPeriod([]);
                _.each(data.transactions, (t) => {
                    this.newTransaction(<Transaction>t);
                });
                _.each(data.offTheBooks, (t) => {
                    this.offTheBooks.push(<Transaction>t);
                });
                _.each(data.estimates, (g: any) => {
                    var estimate = this.newEstimate(g);
                    if (g.expenses) {
                        _.each(g.expenses, (tx: any) => {
                            tx.amount = ko.observable<string>(tx.amount);
                            this.newEstimateExpense(estimate, tx);
                        });
                    }
                });
            }
        }
        catch (e) {
            localStorage.removeItem('data');
            throw e;
        }
        this.pageLoaded = true;
    }

    private getTotal(ts: Array<HasAmount>) {
        var total = 0;
        _.each(ts, function (transaction) {
            total += parseFloat(transaction.amount().toString());
        });
        return total;
    }

    sortPeriods = function () {
        this.currentPeriod.sort((left, right) => {
            return this.currentRange.indexOf(left.day()) > this.currentRange.indexOf(right.day()) ? 1 : -1;
        });

        this.nextPeriod.sort((left, right) => {
            return this.nextRange.indexOf(left.day()) > this.nextRange.indexOf(right.day()) ? 1 : -1;
        });

        this.afterPeriod.sort((left, right) => {
            return this.afterRange.indexOf(left.day()) > this.afterRange.indexOf(right.day()) ? 1 : -1;
        });
    };

    addTxTo = function (transaction, day) {
        if (this.currentRange.indexOf(day) > -1) {
            this.currentPeriod.push(transaction);
        }
        else if (this.nextRange.indexOf(day) > -1) {
            this.nextPeriod.push(transaction);
        }
        else {
            this.afterPeriod.push(transaction);
        }
    };

    private newTransaction = function (tx: Transaction) {
        var transaction = { day: ko.observable(tx.day), forAmount: ko.observable(tx.forAmount), amount: ko.observable(tx.amount) };
        var oldValue : number;
        transaction.day.subscribe(function (_old) {
            oldValue = parseInt(_old(), 10);
        }, transaction, 'beforeChange');

        transaction.day.subscribe((_new) => {
            var newValue = parseInt(_new(), 10);
            if (oldValue !== newValue) {
                if (this.currentRange.indexOf(oldValue) > -1) {
                    this.currentPeriod.remove(transaction);
                }
                else if (this.nextRange.indexOf(oldValue) > -1) {
                    this.nextPeriod.remove(transaction);
                }
                else {
                    this.afterPeriod.remove(transaction);
                }
                this.addTxTo(transaction, newValue);
                this.sortPeriods();
            }
        });

        this.addTxTo(transaction, tx.day);
        this.sortPeriods();
    }

    showOffTheBooks = ko.computed(() => {
        return this.offTheBooks().length > 0;
    });

    showShareBox = () => {
        this.shareBoxVisible(!this.shareBoxVisible());
        this.loadBoxVisible(false);
    };

	showLoadBox = () => {
        this.loadBoxVisible(!this.loadBoxVisible());
        this.shareBoxVisible(false);
    };

    currentPeriodSubTotal = ko.computed(() => {
        return { amount: parseFloat(this.startingAmount()) - this.getTotal(this.currentPeriod()) };
    });
	
	currentPeriodDetails = ko.computed(() => {
        return { amount: parseFloat(this.startingAmount()) - this.getTotal(this.currentPeriod()) - this.getTotal(this.estimates()) };
    });

	nextPeriodDetails = ko.computed(() => {
        return { amount: parseFloat(this.paycheckAmount()) + this.currentPeriodDetails().amount - this.getTotal(this.nextPeriod()) };
    });

	nextPeriodStarting = ko.computed(() => {
        return (parseFloat(this.paycheckAmount()) + this.currentPeriodDetails().amount).toFixed(2);
    });

	afterPeriodDetails = ko.computed(() => {
        return { amount: parseFloat(this.paycheckAmount()) + this.nextPeriodDetails().amount - this.getTotal(this.afterPeriod()) };
    });

	afterPeriodStarting = ko.computed(() => {
        return (parseFloat(this.paycheckAmount()) + this.nextPeriodDetails().amount).toFixed(2);
    });

	data = ko.computed(() => {
        var transactions = [];
        _.each(this.currentPeriod(), function (t) { transactions.push(t); });
        _.each(this.nextPeriod(), function (t) { transactions.push(t); });
        _.each(this.afterPeriod(), function (t) { transactions.push(t); });
        var estimates = [];
        _.each(this.estimates(), function (g) {
            var expenses = [];
            _.each(g.expenses(), function (tx) {
                expenses.push({ amount: tx.amount });
            });
            estimates.push({ forAmount: g.forAmount, amount: g.amount, expenses: expenses });
        });

        var data = ko.toJSON({ startingAmount: this.startingAmount, paycheckAmount: this.paycheckAmount, transactions: transactions, offTheBooks: this.offTheBooks(), estimates: estimates });
        if (this.pageLoaded) {
            localStorage.setItem('data', data); // otherwise update will occur overrided item on load
        }
        return data;
    });

	loadData = ko.computed(() => {
        if (this.dataToLoad()) {
            localStorage.setItem('data', this.dataToLoad());
            this.load();
        }
    });    

    addEstimateExpense = (estimate : Estimate) => {
        var expense: EstimateExpense = { amount: ko.observable<string>(this.newEstimateExpenseAmount()), dateEntered: moment() };
        estimate.expenses.push(expense);
        this.checkEstimateTotal(estimate);
        this.newEstimateExpenseAmount('');
    };

	removeEstimateExpense = function () {
        this.estimate.expenses.remove(this.expense);
    };    
	
	addEstimate = function () {
        this.newEstimate({ forAmount: this.newEstimateFor(), amount: this.newEstimateAmount() });
    };

	removeEstimate = (estimate) => {
        this.estimates.remove(estimate);
    };
	
	addTransaction = function () {
        var day = parseInt(this.newDay(), 10);
        this.newTransaction({ day: day, forAmount: this.newFor(), amount: this.newAmount() });
        this.newDay();
        this.newAmount('');
        this.newFor('');
    };

	removeTransaction = function (transaction) {
        this.offTheBooks.remove(transaction);
    };

	reAddTransaction = function (transaction) {
        this.offTheBooks.remove(transaction);
        this.addTransaction(ko.toJS(transaction));
    }

	markTransactionPaid = function (transaction) {
        this.currentPeriod.remove(transaction);
        this.nextPeriod.remove(transaction);
        this.afterPeriod.remove(transaction);
        this.offTheBooks.push(transaction);
    };

    activate = function() {
        var payDates = new PayPeriods.BiWeeklyPayDateCalculator().getPayDates();
        var payPeriods = new PayPeriods.BiWeeklyPayPeriodCalculator().getPayPeriods(payDates);

        this.currentRange = payPeriods[0];
        this.nextRange = payPeriods[1];
        this.afterRange = payPeriods[2];

        this.currentPayPeriodStart(payDates[0].format('M/D/YYYY'));
        this.nextPayPeriodStart(payDates[1].format('M/D/YYYY'));
        this.currentPayPeriodEnd(payDates[1].subtract('days', 1).format('M/D/YYYY'));
        this.afterPayDate(payDates[2].format('M/D/YYYY'));
        this.nextPayPeriodEnd(payDates[2].subtract('days', 1).format('M/D/YYYY'));

        this.load();
    }
}
return new BudgetViewModel();