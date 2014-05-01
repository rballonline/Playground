import Budget = require('modules/budget');
import ko = require('knockout');
import _ = require('lodash');
import moment = require('moment');

// Convention: 
// add/update -> update UI value
// add/updat(ing) -> subscribe on observable fires
// add/updat(ed) -> UI interactions

class TransactionViewModel {
    forAmount = ko.observable<string>();
    amount = ko.observable<string>();
    day = ko.observable<string>();

    constructor(t: Budget.Transaction) {
        this.forAmount(t.isFor);
        this.amount(t.amount.toFixed(2));
        this.day(t.day.toFixed(2));

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
	
    firstPeriod = ko.observableArray();
    secondPeriod = ko.observableArray();
    thirdPeriod = ko.observableArray();
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

        // Transaction
        amplify.subscribe('add-transaction', () => { });
        amplify.subscribe('transaction-added', () => { });
    }

    addEstimate() {
        this.budget.manageEstimate(new Budget.Estimate(this.newEstimateFor(), parseFloat(this.newEstimateAmount())));
    }

    addTransaction() {
        amplify.publish('adding-transaction', new Budget.Transaction(parseInt(this.newDay(), 10), this.newFor(), parseFloat(this.newAmount())));
    }

    activate = () => {
        this.budget.load();

        var payDates = this.budget.payDates;
        this.firstPayPeriodStart(payDates[0].format('MM/DD/YYYY'));
        this.firstPayPeriodEnd(payDates[1].format('MM/DD/YYYY'));
        this.secondPayPeriodStart(payDates[1].format('MM/DD/YYYY'));
        this.secondPayPeriodEnd(payDates[2].format('MM/DD/YYYY'));
        this.thirdPayDate(payDates[2].format('MM/DD/YYYY'));

        this.startingAmount(this.budget.getStartingAmount().toFixed(2));
        this.paycheckAmount(this.budget.getPaycheckAmount().toFixed(2));

        _.each(this.budget.getTransactions(1), (tx) => {
            this.firstPeriod.push(new TransactionViewModel(tx));
        });
        _.each(this.budget.getTransactions(2), (tx) => {
            this.secondPeriod.push(new TransactionViewModel(tx));
        });
        _.each(this.budget.getTransactions(3), (tx) => {
            this.thirdPeriod.push(new TransactionViewModel(tx));
        });

        this.offTheBooks(this.budget.getOffTheBooks());

        this.estimates(this.budget.getEstimates());
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