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
	
	self.currentPeriod = ko.observableArray();
	self.nextPeriod = ko.observableArray();
	self.afterPeriod = ko.observableArray();

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

	nextPayDate.subtract('weeks', 2);
	var priorPayDate = moment(nextPayDate);
	nextPayDate.add('weeks', 4);
	var afterPayDate = moment(nextPayDate);
	nextPayDate.subtract('weeks', 2);

	var currentRange = getDaysInRange(priorPayDate, nextPayDate),
		nextRange = getDaysInRange(nextPayDate, afterPayDate);

	self.priorPayDate(priorPayDate.format('M/D/YYYY'));
	self.nextPayDate(nextPayDate.format('M/D/YYYY'));
	self.afterPayDate(afterPayDate.format('M/D/YYYY'));
	
	function addTransaction(day, forAmount, amount) {
		var transaction = { day: ko.observable(day), forAmount: ko.observable(forAmount), amount: ko.observable(amount) };
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
				if (currentRange.indexOf(newValue) > -1) {
					self.currentPeriod.push(transaction);
				}
				else if (nextRange.indexOf(newValue) > -1) {
					self.nextPeriod.push(transaction);
				}
				else {
					self.afterPeriod.push(transaction);
				}
			}
		});
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
					addTransaction(t.day, t.forAmount, t.amount);
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
		return { amount: (parseFloat(self.startingAmount()) - getTotal(self.currentPeriod())).toFixed(2) }; // toFixed returns string
	});

	self.nextPeriodDetails = ko.computed(function () {
		return { amount: (parseFloat(self.paycheckAmount()) + parseFloat(self.currentPeriodDetails().amount) - getTotal(self.nextPeriod())).toFixed(2) };
	});

	self.afterPeriodDetails = ko.computed(function () {
		return { amount: (parseFloat(self.paycheckAmount()) + parseFloat(self.nextPeriodDetails().amount) - getTotal(self.afterPeriod())).toFixed(2) };
	});

	self.data = ko.computed(function () {
		var transactions = [];
		_.each(self.currentPeriod(), function (t) { transactions.push(t); });
		_.each(self.nextPeriod(), function (t) { transactions.push(t); });
		_.each(self.afterPeriod(), function (t) { transactions.push(t); });

		var data = ko.toJSON({ startingAmount: self.startingAmount, paycheckAmount: self.paycheckAmount, transactions: transactions });
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
	
	self.addTransaction = function() {
		var day = parseInt(self.newDay(), 10);
		addTransaction(day, self.newFor(), self.newAmount());
		self.newDay();
		self.newAmount('');
		self.newFor('')
	};

	self.removeTransaction = function (transaction) {
		self.currentPeriod.remove(function(item) { return item.day === transaction.day });
		self.nextPeriod.remove(function (item) { return item.day === transaction.day });
		self.afterPeriod.remove(function (item) { return item.day === transaction.day });
	};

	load();
};
ko.applyBindings(new vm());