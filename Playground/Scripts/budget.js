var Budget = (function () {
    function Budget(firstPayDate) {
        this.payPeriodLength = 2;
        this._payDate = moment(firstPayDate).subtract('days', 1);

        while (this._payDate < moment()) {
            this._payDate.add('weeks', 2);
        }
        this._nextPayDate = moment(this._payDate);
        this._priorPayDate = moment(this._payDate.subtract('weeks', 2));
        this._afterPayDate = moment(this._payDate.add('weeks', 4));
        this._afterThatPayDate = moment(this._payDate.add('weeks', 2));

        this._thisPayPeriod = this.getPayPeriod(this._priorPayDate, this._nextPayDate);
    }
    Budget.prototype.getPayPeriod = function (startMoment, endMoment) {
        var daysInRange;
        if (startMoment.month() == endMoment.month()) {
            for (var i = startMoment.date(); i <= endMoment.date(); i++) {
                daysInRange.push(i);
            }
        } else {
            for (var i = startMoment.date(); i <= moment().daysInMonth(); i++) {
                daysInRange.push(i);
            }
            for (var i = 1; i <= endMoment.date(); i++) {
                daysInRange.push(i);
            }
        }
        return daysInRange;
    };
    return Budget;
})();
//# sourceMappingURL=budget.js.map
