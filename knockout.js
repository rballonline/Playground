function getRanges() {
	var nextPayDate = moment('3/7/2014');
	while(nextPayDate < moment()) {
		nextPayDate = nextPayDate.add('weeks', 2);
	}
	
	nextPayDate.subtract('weeks', 2);
	var priorPayDate = moment(nextPayDate);
	nextPayDate.add('weeks', 4);
	var afterPayDate = moment(nextPayDate);
	nextPayDate.subtract('weeks', 2);
	
	var currentRange = getDaysInRange(priorPayDate, nextPayDate),
		nextRange = getDaysInRange(nextPayDate, afterPayDate);
	
	return { currentRange: currentRange, nextRange: nextRange };
}

function getDaysInRange(startMoment, endMoment) {
	var daysInRange = [];
	if(startMoment.month() == endMoment.month()) {
		for(var i = startMoment.date(); i <= endMoment.date(); i++) {
			daysInRange.push(i);
		}
	}
	else {
		for(var i = startMoment.date(); i <= moment().daysInMonth(); i++) {
			daysInRange.push(i);
		}
		for(var i = 1; i <= endMoment.date(); i++) {
			daysInRange.push(i);
		}
	}
	return daysInRange;
}

var vm = function() {
	var self = this;
	self.newDay = ko.observable();
	self.newFor = ko.observable();
	self.newAmount = ko.observable();
	self.startingAmount = ko.observable(1000);
	
	self.currentPeriod = ko.observableArray();
	self.nextPeriod = ko.observableArray();
	self.afterPeriod = ko.observableArray();
	
	var r = getRanges();
	function addTransaction(day, forAmount, amount) {
		var transaction = { day: ko.observable(day), forAmount: ko.observable(forAmount), amount: ko.observable(amount) };
		if (r.currentRange.indexOf(day) > -1) {
			self.currentPeriod.push(transaction);
		}
		else if (r.nextRange.indexOf(day) > -1) {
			self.nextPeriod.push(transaction);
		}
		else {
			self.afterPeriod.push(transaction);
		}
	}

	function load() {
		if (localStorage.getItem('data')) {
			var transactions = JSON.parse(localStorage.getItem('data'));
			_.each(transactions, function (t) {
				addTransaction(t.day, t.forAmount, t.amount);
			});
		}
	}

	function getTotal(ts) {
		var total = 0;
		_.each(ts, function (transaction) {
			total += parseFloat(transaction.amount());
		});
		return total;
	}
	
	self.currentPeriodDetails = ko.computed(function () {
		return { amount: (parseFloat(self.startingAmount()) - getTotal(self.currentPeriod())).toFixed(2) };
	});

	self.nextPeriodDetails = ko.computed(function () {
		return { amount: (self.currentPeriodDetails().amount - getTotal(self.nextPeriod())).toFixed(2) };
	});

	self.afterPeriodDetails = ko.computed(function () {
		return { amount: (self.nextPeriodDetails().amount - getTotal(self.afterPeriod())).toFixed(2) };
	});

	self.data = ko.computed(function () {
		var transactions = [];
		_.each(self.currentPeriod(), function (t) { transactions.push(t); });
		_.each(self.nextPeriod(), function (t) { transactions.push(t); });
		_.each(self.afterPeriod(), function (t) { transactions.push(t); });

		var data = { startingAmount: self.startingAmount, transactions: ko.toJSON(transactions) };
		localStorage.setItem('data', data);
		return transactions;
	});
	
	
	self.addTransaction = function() {
		var day = parseInt(self.newDay(), 10);
		addTransaction(day, self.newFor(), self.newAmount());
	};
	
	self.editTransaction = function(transaction) {
	};

	self.removeTransaction = function (transaction) {
		self.currentPeriod.remove(function(item) { return item.day === transaction.day });
		self.nextPeriod.remove(function (item) { return item.day === transaction.day });
		self.afterPeriod.remove(function (item) { return item.day === transaction.day });
	};

	load();
};
ko.applyBindings(new vm());