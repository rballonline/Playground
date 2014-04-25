import payPeriods = require('../App/modules/payPeriods');
import budget = require('../App/modules/budget');

describe("For the bi weekly pay dates", function () {
    var biWeeklyPayDateCalculator = new payPeriods.BiWeeklyPayDateCalculator();
    var payDates = biWeeklyPayDateCalculator.getPayDates('01/15/2050');

    it('there should be 4.', () => {
        expect(payDates.length).toBe(4);
    });

    it("the first one was on the 1st", function () {
        expect(payDates[0].format('MM/DD/YYYY')).toBe('01/01/2050');
    });
    it("the second one was on the 15th", function () {
        expect(payDates[1].format('MM/DD/YYYY')).toBe('01/15/2050');
    });
    it("the third one was on the 29th", function () {
        expect(payDates[2].format('MM/DD/YYYY')).toBe('01/29/2050');
    });
    it("the last one was on the 31st", function () {
        expect(payDates[3].format('MM/DD/YYYY')).toBe('02/01/2050');
    });
});

describe("For the bi weekly pay dates spanning differrent months", function () {
    var biWeeklyPayDateCalculator = new payPeriods.BiWeeklyPayDateCalculator();
    var payDates = biWeeklyPayDateCalculator.getPayDates('01/05/2050');

    it('there should be 4.', () => {
        expect(payDates.length).toBe(4);
    });

    it("the first one was on the 22nd", function () {
        expect(payDates[0].format('MM/DD/YYYY')).toBe('12/22/2049');
    });
    it("the second one was on the 5th", function () {
        expect(payDates[1].format('MM/DD/YYYY')).toBe('01/05/2050');
    });
    it("the third one was on the 19th", function () {
        expect(payDates[2].format('MM/DD/YYYY')).toBe('01/19/2050');
    });
    it("the last one was on the 22nd", function () {
        expect(payDates[3].format('MM/DD/YYYY')).toBe('01/22/2050');
    });
});

describe('For bi weekly pay periods', () => {
    var biWeeklyPayDateCalculator = new payPeriods.BiWeeklyPayDateCalculator();
    var payDates = biWeeklyPayDateCalculator.getPayDates('01/15/2050');

    var biWeeklyPayPeriodCalculator = new payPeriods.BiWeeklyPayPeriodCalculator();
    var periods = biWeeklyPayPeriodCalculator.getPayPeriods(payDates);

    it("there should be three segments", () => {
        expect(periods.length).toBe(3);
    });

    it('the first period should contain the correct days', () => {
        for(var i = 1; i < 15; i++) {
            expect(periods[0]).toContain(i);
        }
    });

    it('the second period should contain the correct days', () => {
        for(var i = 15; i < 29; i++) {
            expect(periods[1]).toContain(i);
        }
    });

    it('the third period should contain the correct days', () => {
        for(var i = 29; i < 32; i++) {
            expect(periods[2]).toContain(i);
        }
    });
});

describe('For bi weekly pay periods spanning different months', () => {
    var biWeeklyPayDateCalculator = new payPeriods.BiWeeklyPayDateCalculator();
    var payDates = biWeeklyPayDateCalculator.getPayDates('01/05/2050');

    var biWeeklyPayPeriodCalculator = new payPeriods.BiWeeklyPayPeriodCalculator();
    var periods = biWeeklyPayPeriodCalculator.getPayPeriods(payDates);

    it("there should be three segments", () => {
        expect(periods.length).toBe(3);
    });

    it('the first period should contain the correct days', () => {
        for(var i = 22; i < 32; i++) {
            expect(periods[0]).toContain(i);
        }
        for(var i = 1; i < 5; i++) {
            expect(periods[0]).toContain(i);
        }
    });

    it('the second period should contain the correct days', () => {
        for(var i = 5; i < 19; i++) {
            expect(periods[1]).toContain(i);
        }
    });

    it('the third period should contain the correct days', () => {
        for(var i = 19; i < 22; i++) {
            expect(periods[2]).toContain(i);
        }
    });
});