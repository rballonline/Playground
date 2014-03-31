ko.bindingHandlers.selectAll = {
	init: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
		$(element).click(function () {
			element.select();
		});
	}
};

var vm = function() {
	var self = this, pageLoaded = false;

	self.priorPayDate = ko.observable();
	self.nextPayDate = ko.observable();
	self.afterPayDate = ko.observable();

	self.newDay = ko.observable();
	self.newFor = ko.observable();
	self.newAmount = ko.observable();
	self.startingAmount = ko.observable(1000);
	self.paycheckAmount = ko.observable();
	self.dataToLoad = ko.observable();
	self.shareBoxVisible = ko.observable(false);
	self.loadBoxVisible = ko.observable(false);

	self.newGoalFor = ko.observable();
	self.newGoalAmount = ko.observable();
	self.newGoalTransactionAmount = ko.observable();
	
	self.currentPeriod = ko.observableArray();
	self.nextPeriod = ko.observableArray();
	self.afterPeriod = ko.observableArray();
	self.offTheBooks = ko.observableArray();
	self.goals = ko.observableArray();
	self.showOffTheBooks = ko.computed(function () {
		return self.offTheBooks().length > 0;
	});

	function getDaysInRange(startMoment, endMoment) {
		var daysInRange = [];
		if (startMoment.month() == endMoment.month()) {
			for (var i = startMoment.date() ; i <= endMoment.date() ; i++) {
				daysInRange.push(i);
			}
		}
		else {
			for (var i = startMoment.date() ; i <= moment().daysInMonth() ; i++) {
				daysInRange.push(i);
			}
			for (var i = 1; i <= endMoment.date() ; i++) {
				daysInRange.push(i);
			}
		}
		return daysInRange;
	}

	var nextPayDate = moment('3/7/2014');
	while (nextPayDate < moment()) {
		nextPayDate = nextPayDate.add('weeks', 2);
	}

	var priorPayDate = moment(nextPayDate.subtract('weeks', 2)),
		afterPayDate = moment(nextPayDate.add('weeks', 4)),
		afterThatPayDate = moment(nextPayDate.add('weeks', 2));
	nextPayDate.subtract('weeks', 4);

	var currentRange = getDaysInRange(priorPayDate, nextPayDate),
		nextRange = getDaysInRange(nextPayDate, afterPayDate),
		afterRange = getDaysInRange(afterPayDate, afterThatPayDate);

	self.priorPayDate(priorPayDate.format('M/D/YYYY'));
	self.nextPayDate(nextPayDate.format('M/D/YYYY'));
	self.afterPayDate(afterPayDate.format('M/D/YYYY'));

	function sortPeriods() {
		self.currentPeriod.sort(function (left, right) {
			return currentRange.indexOf(left.day()) > currentRange.indexOf(right.day()) ? 1 : -1;
		});

		self.nextPeriod.sort(function (left, right) {
			return nextRange.indexOf(left.day()) > nextRange.indexOf(right.day()) ? 1 : -1;
		});

		self.afterPeriod.sort(function (left, right) {
			return afterRange.indexOf(left.day()) > afterRange.indexOf(right.day()) ? 1 : -1;
		});
	}

	function addTxTo(transaction, day) {
		if (currentRange.indexOf(day) > -1) {
			self.currentPeriod.push(transaction);
		}
		else if (nextRange.indexOf(day) > -1) {
			self.nextPeriod.push(transaction);
		}
		else {
			self.afterPeriod.push(transaction);
		}
	}
	
	function addTransaction(tx) {
		var transaction = { day: ko.observable(tx.day), forAmount: ko.observable(tx.forAmount), amount: ko.observable(tx.amount) };
		var oldValue;
		transaction.day.subscribe(function (_old) {
			oldValue = parseInt(_old, 10);
		}, transaction, 'beforeChange');

		transaction.day.subscribe(function (newValue) {
			newValue = parseInt(newValue, 10);
			if (oldValue !== newValue) {
				if (currentRange.indexOf(oldValue) > -1) {
					self.currentPeriod.remove(transaction);
				}
				else if (nextRange.indexOf(oldValue) > -1) {
					self.nextPeriod.remove(transaction);
				}
				else {
					self.afterPeriod.remove(transaction);
				}
				addTxTo(transaction, newValue);
				sortPeriods();
			}
		});

		addTxTo(transaction, tx.day);
		sortPeriods();
	}

	function load() {
		try {
			if (localStorage.getItem('data')) {
				var data = JSON.parse(localStorage.getItem('data'));
				self.startingAmount(data.startingAmount);
				self.paycheckAmount(data.paycheckAmount);
				self.currentPeriod([]);
				self.nextPeriod([]);
				self.afterPeriod([]);
				_.each(data.transactions, function (t) {
					addTransaction(t);
				});
				_.each(data.offTheBooks, function (t) {
					self.offTheBooks.push(t);
				});
				_.each(data.goals, function (g) {
					goal = addGoal(g);
					_.each(g.transactions, function (tx) {
						addGoalTransaction(goal, tx);
					});
				});
			}
		}
		catch(e) {
			localStorage.removeItem('data');
		}
		pageLoaded = true;
	}

	function getTotal(ts) {
		var total = 0;
		_.each(ts, function (transaction) {
			total += parseFloat(transaction.amount());
		});
		return total;
	}

	self.showShareBox = function () {
		self.shareBoxVisible(!self.shareBoxVisible());
		self.loadBoxVisible(false);
	};

	self.showLoadBox = function () {
		self.loadBoxVisible(!self.loadBoxVisible());
		self.shareBoxVisible(false);
	};
	
	self.currentPeriodDetails = ko.computed(function () {
		return { amount: parseFloat(self.startingAmount()) - getTotal(self.currentPeriod()) - getTotal(self.goals()) };
	});

	self.nextPeriodDetails = ko.computed(function () {
		return { amount: parseFloat(self.paycheckAmount()) + self.currentPeriodDetails().amount - getTotal(self.nextPeriod()) };
	});

	self.nextPeriodStarting = ko.computed(function () {
		return (parseFloat(self.paycheckAmount()) + self.currentPeriodDetails().amount).toFixed(2);
	});

	self.afterPeriodDetails = ko.computed(function () {
		return { amount: parseFloat(self.paycheckAmount()) + self.nextPeriodDetails().amount - getTotal(self.afterPeriod()) };
	});

	self.afterPeriodStarting = ko.computed(function () {
		return (parseFloat(self.paycheckAmount()) + self.nextPeriodDetails().amount).toFixed(2);
	});

	self.data = ko.computed(function () {
		var transactions = [];
		_.each(self.currentPeriod(), function (t) { transactions.push(t); });
		_.each(self.nextPeriod(), function (t) { transactions.push(t); });
		_.each(self.afterPeriod(), function (t) { transactions.push(t); });
		var goals = [];
		_.each(self.goals(), function (g) {
			var transactions = [];
			_.each(g.transactions(), function (tx) {
				transactions.push({ dateOf: tx.dateOf, amount: tx.amount });
			});
			goals.push({ forAmount: g.forAmount, amount: g.amount, transactions: transactions });
		});

		var data = ko.toJSON({ startingAmount: self.startingAmount, paycheckAmount: self.paycheckAmount, transactions: transactions, offTheBooks: self.offTheBooks(), goals: goals });
		if (pageLoaded) {
			localStorage.setItem('data', data); // otherwise update will occur overrided item on load
		}
		return data;
	});

	self.loadData = ko.computed(function () {
		if (self.dataToLoad()) {
			localStorage.setItem('data', self.dataToLoad());
			load();
		}
	});

	function checkGoalTotal(goal) {
		if (goal.total() > goal.amount()) {
			goal.amount(goal.total()); // right now just increase the goal
		}
	}

	function addGoalTransaction(goal, tx) {
		var amount = ko.observable(parseFloat(tx.amount));
		goal.transactions.push({ dateOf: tx.dateOf, amount: amount });
		amount.subscribe(function (newValue) {
			checkGoalTotal(goal);
		});
	}

	self.addGoalTransaction = function (goal) {
		addGoalTransaction(goal, { dateOf: moment().format('M/D/YYYY'), amount: goal.newExpense() });
		checkGoalTotal(goal);
		goal.newExpense('');
	};

	self.removeGoalTransaction = function () {
		this.goal.transactions.remove(this.transaction);
	};

	function addGoal(goal) {
		var g = {
			forAmount: ko.observable(goal.forAmount),
			amount: ko.observable(parseFloat(goal.amount)),
			transactions: ko.observableArray(),
			newExpense: ko.observable()
		};
		g.total = ko.computed(function () {
			return getTotal(g.transactions());
		});
		g.amountLeft = ko.computed(function () {
			return g.amount() - getTotal(g.transactions());
		});
		self.goals.push(g);
		return g;
	}
	
	self.addGoal = function () {
		addGoal({ forAmount: self.newGoalFor(), amount: self.newGoalAmount() });
	};

	self.removeGoal = function () {
		self.goals.remove(this);
	};
	
	self.addTransaction = function() {
		var day = parseInt(self.newDay(), 10);
		addTransaction({ day: day, forAmount: self.newFor(), amount: self.newAmount() });
		self.newDay();
		self.newAmount('');
		self.newFor('');
	};

	self.removeTransaction = function (transaction) {
		self.offTheBooks.remove(transaction);
	};

	self.reAddTransaction = function (transaction) {
		self.offTheBooks.remove(transaction);
		addTransaction(ko.toJS(transaction));
	}

	self.markTransactionPaid = function (transaction) {
		self.currentPeriod.remove(transaction);
		self.nextPeriod.remove(transaction);
		self.afterPeriod.remove(transaction);
		self.offTheBooks.push(transaction);
	};

	load();
};
ko.applyBindings(new vm());