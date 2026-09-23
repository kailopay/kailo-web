declare const getLastDayOfMonth: () => number;
declare const getAdjustedBillingCycleStart: (billingCycleStart: number) => number;
declare const getBillingStartDate: (billingCycleStart: number) => Date;

export { getAdjustedBillingCycleStart, getBillingStartDate, getLastDayOfMonth };
