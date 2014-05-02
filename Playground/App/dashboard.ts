import Budget = require('modules/budget');
import ko = require('knockout');
import _ = require('lodash');
import moment = require('moment');

var budget = new Budget.BiWeeklyBudget();

//TODO: Expenses are not adding

class TransactionViewModel {
    forAmount = ko.observable<string>();
    amount = ko.observable<string>();
    day = ko.observable<string>();
    id: string;

    constructor(t: Budget.Transaction) {
        this.id = t.id;
        this.forAmount(t.forAmount);
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

class ExpenseViewModel {
    id: string;
    parentId: string;
    dateEntered: string;
    amount = ko.observable<string>();

    constructor(expense: Budget.Expense) {
        this.id = expense.id;
        this.parentId = expense.parentId;
        this.dateEntered = expense.dateEntered;
        this.amount(expense.amount.toFixed(2));

        this.amount.subscribe((value) => {
            budget.updateExpenseAmount(expense, value);
        });
    }
}

class EstimateViewModel {
    id: string;
    forAmount = ko.observable<string>();
    amount = ko.observable<string>();
    amountLeft = ko.observable<string>();
    total = ko.observable<string>();
    expenses = ko.observableArray<ExpenseViewModel>();
    newExpenseAmount = ko.observable<string>();

    constructor(estimate: Budget.Estimate) {
        this.id = estimate.id;
        this.forAmount(estimate.forAmount);
        this.amount(estimate.amount.toFixed(2));
        this.amountLeft(estimate.amountLeft().toFixed(2));
        this.total(estimate.total().toFixed(2));

        this.amount.subscribe((value) => {
            budget.updateEstimateAmount(estimate, value);
        });

        this.forAmount.subscribe((value) => {
            budget.udpateEstimateFor(estimate, value);
        });

        _.each(estimate.expenses, (expense: Budget.Expense) => {
            this.expenses.push(new ExpenseViewModel(expense));
        });
    }
}

class BudgetViewModel {

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
        return this.offTheBooks().length > 0;
    });

    constructor() {
        // Starting amount
        amplify.subscribe('update-starting-amount', (newValue) => {
            this.startingAmount(newValue);
        });
        this.startingAmount.subscribe((newValue) => {
            amplify.publish('updating-starting-amount', newValue);
        });

        // Paycheck amount
        amplify.subscribe('update-paycheck-amount', (newValue) => {
            this.paycheckAmount(newValue);
        });
        this.paycheckAmount.subscribe((newValue) => {            
            amplify.publish('updating-paycheck-amount', newValue);
        });

        amplify.subscribe('update-estimate', (estimate: Budget.Estimate) => {
            var estimateVm = _.find(this.estimates(), (e : EstimateViewModel) => {
                return estimate.id == e.id;
            });
            estimateVm = new EstimateViewModel(estimate);
        });

        amplify.subscribe('update-estimates', () => {
            this.updateEstimates();
        });
        amplify.subscribe('update-totals', () => {
            this.updateTotals();
        });
        amplify.subscribe('update-periods', () => {
            this.updatePeriods();
        });
        amplify.subscribe('update-all', () => {
            this.updateAll();
        });
    }

    addTransaction() {
        budget.addTransaction(new Budget.Transaction(parseInt(this.newDay(), 10), this.newFor(), parseFloat(this.newAmount())));
    }

    addEstimate() {
        var estimate = new Budget.Estimate(this.newEstimateFor(), parseFloat(this.newEstimateAmount()));
        budget.addEstimate(estimate);
    }

    addExpense(estimate: EstimateViewModel) {
        budget.addExpense(estimate.id, estimate.newExpenseAmount());
    }

    moveTransaction(transaction: TransactionViewModel) {
        amplify.publish('moving-transaction', transaction.id);  
    }

    removeEstimate(estimate: EstimateViewModel) {
        budget.removeEstimate(estimate.id);
    }

    activate = () => {
        budget.load();

        var payDates = budget.payDates;
        this.firstPayPeriodStart(payDates[0].format('MM/DD/YYYY'));
        this.firstPayPeriodEnd(payDates[1].subtract('d', 1).format('MM/DD/YYYY'));
        this.secondPayPeriodStart(payDates[1].add('d', 1).format('MM/DD/YYYY'));
        this.secondPayPeriodEnd(payDates[2].subtract('d', 1).format('MM/DD/YYYY'));
        this.thirdPayDate(payDates[2].add('d', 1).format('MM/DD/YYYY'));
        this.startingAmount(budget.getStartingAmount().toFixed(2));
        this.paycheckAmount(budget.getPaycheckAmount().toFixed(2));
    }

    private update(period, num) {
        period.removeAll();
        _.each(budget.getTransactions(num), (transaction: Budget.Transaction) => {
            period.push(new TransactionViewModel(transaction));
        });
    }

    private updateAll() {
        this.updateOffTheBooks();
        this.updateEstimates();
        this.updatePeriods();
    }

    private updatePeriods() {
        this.update(this.firstPeriod, 1);
        this.update(this.secondPeriod, 2);
        this.update(this.thirdPeriod, 3);
        this.updateTotals();
    }

    private updateOffTheBooks() {
        this.offTheBooks(budget.getOffTheBooks());
    }

    private updateEstimates() {
        this.estimates.removeAll();
        _.each(budget.getEstimates(), (estimate: Budget.Estimate) => {
            this.estimates.push(new EstimateViewModel(estimate));
        });
        this.updateTotals();
    }

    private updateTotals() {
        this.firstPeriodSubTotal(budget.getEndingBalance(0).toFixed(2));
        this.firstPeriodEnding(budget.getEndingBalance(1).toFixed(2));
        this.secondPeriodStarting(budget.getStartingBalance(2).toFixed(2));
        this.secondPeriodEnding(budget.getEndingBalance(2).toFixed(2));
        this.thirdPeriodStarting(budget.getStartingBalance(3).toFixed(2));
        this.thirdPeriodEnding(budget.getEndingBalance(3).toFixed(2));
    }
}
return new BudgetViewModel();