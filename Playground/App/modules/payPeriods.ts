import moment = require('moment');

export interface PayDateCalculator {
    getPayDates(options: any): Array<Moment>;
}

export class BiWeeklyPayDateCalculator implements PayDateCalculator {
    getPayDates(firstPayDate?: string): Array<Moment> {
        var payDates: Array<Moment> = [];
        var payDate = moment(firstPayDate || '4/4/2014');

        while (payDate < moment().startOf('day')) {
            payDate.add('weeks', 2); // get the next pay date
        }
        payDates.push(moment(payDate.subtract('weeks', 2)));
        payDates.push(moment(payDate.add('weeks', 2)));
        payDates.push(moment(payDate.add('weeks', 2)));
        payDates.push(moment(payDate.subtract('weeks', 4).add('months', 1)));
        return payDates;
    }
}

export interface PayPeriodCalculator {
    getPayPeriods(payDates: Array<Moment>): Array<Array<number>>;
}

export class BiWeeklyPayPeriodCalculator implements PayPeriodCalculator {
    getPayPeriods(payDates: Array<Moment>): Array<Array<number>> {
        var payPeriods: Array<Array<number>> = [];
        payPeriods.push(this.getPayPeriod(payDates[0], payDates[1]));
        payPeriods.push(this.getPayPeriod(payDates[1], payDates[2]));
        payPeriods.push(this.getPayPeriod(payDates[2], payDates[3]));
        return payPeriods;
    }

    private getPayPeriod(startMoment: Moment, endMoment: Moment) {
        var daysInRange: Array<number> = [];
        if (startMoment.month() == endMoment.month()) {
            for (var i = startMoment.date(); i < endMoment.date(); i++) {
                daysInRange.push(i);
            }
        }
        else {
            for (var i = startMoment.date(); i <= startMoment.daysInMonth(); i++) {
                daysInRange.push(i);
            }
            for (var i = 1; i < endMoment.date(); i++) {
                daysInRange.push(i);
            }
        }
        return daysInRange;
    }
}