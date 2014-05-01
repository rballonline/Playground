import Budget = require('modules/budget');
import ko = require('knockout');
import _ = require('lodash');
import moment = require('moment');

// Convention: 
// add/update -> update UI value (for observables)
// add/updat(ing) -> change the value in actual budget
// add/updat(ed) -> update UI based on budget

class TransactionViewModel {
    forAmount = ko.observable<string>();
    amount = ko.observable<string>();
    day = ko.observable<string>();
    id: string;

    constructor(t: Budget.Transaction) {
        this.id = t.id;
        this.forAmount(t.isFor);
        this.amount(t.amount.toFixed(2));
        this.day(t.day.toString());

        this.forAmount.subscribe((newValue) => {
            amplify.publish('updating-transaction-is-for', t, newValue);
        });

        this.amount.subscribe((newValue) => {
            amplify.publish('updating-transaction-amount', t, newValue);
        });

        this.day.subscribe((newValue) => {
            amplify.publish('updating-transaction-day', t, newValue);
        });
    }
}

class BudgetViewModel {
    private budget = new Budget.BiWeeklyBudget();

    pageLoaded = false;

    firstPayPeriodStart = ko.observable<string>();
    firstPayPeriodEnd = ko.observable<string>();
    secondPayPeriodStart = ko.observable<string>();
    secondPayPeriodEnd = ko.observable<string>();
    thirdPayDate = ko.observable<string>();

	newDay = ko.observable<string>();
	newFor = ko.observable<string>();
    newAmount = ko.observable<string>();

    startingAmount = ko.observable<string>();
	paycheckAmount = ko.observable<string>();
    
	newEstimateFor = ko.observable<string>();
    newEstimateAmount = ko.observable<string>();
    newEstimateExpenseAmount = ko.observable<string>();

    firstPeriodSubTotal = ko.observable();
    firstPeriodEnding = ko.observable();
    secondPeriodStarting = ko.observable();
    secondPeriodEnding = ko.observable();
    thirdPeriodStarting = ko.observable();
    thirdPeriodEnding = ko.observable();
	
    firstPeriod = ko.observableArray<TransactionViewModel>();
    secondPeriod = ko.observableArray<TransactionViewModel>();
    thirdPeriod = ko.observableArray<TransactionViewModel>();
    offTheBooks = ko.observableArray();

    estimates = ko.observableArray();

    showOffTheBooks = ko.computed(() => {
        return this.offTheBooks.length > 0;
    });

    constructor() {
        // Starting amount
        amplify.subscribe('update-starting-amount', (newValue) => {
            this.startingAmount(newValue);
        });
        this.startingAmount.subscribe((newValue) => {
            amplify.publish('updating-starting-amount', newValue);
        });
        amplify.subscribe('starting-amount-updated', () => {
            this.updateTotals();
        });

        // Paycheck amount
        amplify.subscribe('update-paycheck-amount', (newValue) => {
            this.paycheckAmount(newValue);
        });
        this.paycheckAmount.subscribe((newValue) => {            
            amplify.publish('updating-paycheck-amount', newValue);
        });
        amplify.subscribe('paycheck-amount-updated', () => {
            this.updateTotals();
        });

        amplify.subscribe('transaction-updated', () => {
            this.updatePeriods();
            this.updateTotals();
        });

        amplify.subscribe('transaction-moved', () => {
            this.updatePeriods();
            this.updateTotals();
        });
    }

    addEstimate() {
        this.budget.manageEstimate(new Budget.Estimate(this.newEstimateFor(), parseFloat(this.newEstimateAmount())));
    }

    addTransaction() {
        amplify.publish('updating-transaction', new Budget.Transaction(parseInt(this.newDay(), 10), this.newFor(), parseFloat(this.newAmount())));
    }

    removeTransaction(transaction: TransactionViewModel) {
        amplify.publish('moving-transaction', transaction.id);  
    }

    activate = () => {
        this.budget.load();

        var payDates = this.budget.payDates;
        this.firstPayPeriodStart(payDates[0].format('MM/DD/YYYY'));
        this.firstPayPeriodEnd(payDates[1].subtract('d', 1).format('MM/DD/YYYY'));
        this.secondPayPeriodStart(payDates[1].add('d', 1).format('MM/DD/YYYY'));
        this.secondPayPeriodEnd(payDates[2].subtract('d', 1).format('MM/DD/YYYY'));
        this.thirdPayDate(payDates[2].add('d', 1).format('MM/DD/YYYY'));
    }

    private update(period, num) {
        period.removeAll();
        _.each(this.budget.getTransactions(num), (transaction: Budget.Transaction) => {
            period.push(new TransactionViewModel(transaction));
        });
    }

    private updatePeriods() {
        this.update(this.firstPeriod, 1);
        this.update(this.secondPeriod, 2);
        this.update(this.thirdPeriod, 3);

        this.offTheBooks(this.budget.getOffTheBooks());
    }

    private updateTotals() {
        this.firstPeriodSubTotal(this.budget.getEndingBalance(0).toFixed(2));
        this.firstPeriodEnding(this.budget.getEndingBalance(1).toFixed(2));
        this.secondPeriodStarting(this.budget.getStartingBalance(2).toFixed(2));
        this.secondPeriodEnding(this.budget.getEndingBalance(2).toFixed(2));
        this.thirdPeriodStarting(this.budget.getStartingBalance(3).toFixed(2));
        this.thirdPeriodEnding(this.budget.getEndingBalance(3).toFixed(2));
    }
}
return new BudgetViewModel();