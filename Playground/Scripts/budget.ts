interface HasAmount {
    amount: KnockoutObservable<number>;
}

interface Transaction extends HasAmount  {
    day: KnockoutObservable<number>;
    forAmount: KnockoutObservable<string>;
}

interface PayPeriod {
    transactions: Array<Transaction>;
}

class Budget {
    private payPeriodLength: number = 2;
    private _payDate: Moment;
    private _priorPayDate: Moment;
    private _nextPayDate: Moment;
    private _afterPayDate: Moment;
    private _afterThatPayDate: Moment;

    private _thisPayPeriod: Array<number>;
    private _nextPayPeriod: Array<number>;
    private _afterPayPeriod: Array<number>;

    constructor(firstPayDate: string) {
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

    private getPayPeriod(startMoment : Moment, endMoment: Moment) {
        var daysInRange: Array<number>;
        if (startMoment.month() == endMoment.month()) {
            for (var i = startMoment.date(); i <= endMoment.date(); i++) {
                daysInRange.push(i);
            }
        }
        else {
            for (var i = startMoment.date(); i <= moment().daysInMonth(); i++) {
                daysInRange.push(i);
            }
            for (var i = 1; i <= endMoment.date(); i++) {
                daysInRange.push(i);
            }
        }
        return daysInRange;
    }
}