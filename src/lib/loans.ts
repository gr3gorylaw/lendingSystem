// EMI Calculation using reducing balance method
// EMI = P * r * (1 + r)^n / ((1 + r)^n - 1)
// Where: P = Principal, r = monthly interest rate, n = number of months

export function calculateEMI(
  principal: number,
  annualInterestRate: number,
  tenureMonths: number
): number {
  if (principal <= 0 || tenureMonths <= 0) return 0;
  if (annualInterestRate <= 0) return principal / tenureMonths;

  const monthlyRate = annualInterestRate / 12 / 100;
  const factor = Math.pow(1 + monthlyRate, tenureMonths);
  const emi = (principal * monthlyRate * factor) / (factor - 1);

  return Math.round(emi * 100) / 100;
}

export function calculateTotalPayable(
  principal: number,
  annualInterestRate: number,
  tenureMonths: number
): number {
  const emi = calculateEMI(principal, annualInterestRate, tenureMonths);
  return Math.round(emi * tenureMonths * 100) / 100;
}

export function generateRepaymentSchedule(
  principal: number,
  annualInterestRate: number,
  tenureMonths: number,
  emi: number,
  startDate: Date = new Date()
): Array<{
  installmentNumber: number;
  dueDate: Date;
  emiAmount: number;
  principalAmount: number;
  interestAmount: number;
}> {
  const schedule = [];
  const monthlyRate = annualInterestRate / 12 / 100;
  let balance = principal;

  for (let i = 1; i <= tenureMonths; i++) {
    const interestAmount = Math.round(balance * monthlyRate * 100) / 100;
    const principalAmount = Math.round((emi - interestAmount) * 100) / 100;
    balance = Math.round((balance - principalAmount) * 100) / 100;

    const dueDate = new Date(startDate);
    dueDate.setMonth(dueDate.getMonth() + i);

    schedule.push({
      installmentNumber: i,
      dueDate,
      emiAmount: emi,
      principalAmount,
      interestAmount,
    });
  }

  return schedule;
}

export function generateLoanNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `LN-${timestamp}-${random}`;
}

export function generateApplicationNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `APP-${timestamp}-${random}`;
}

export function generatePaymentNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `PAY-${timestamp}-${random}`;
}

export function calculateLateFee(
  emiAmount: number,
  lateFeePercentage: number,
  daysOverdue: number
): number {
  if (daysOverdue <= 0) return 0;
  // Simple daily late fee calculation
  const monthlyLateFee = emiAmount * (lateFeePercentage / 100);
  const dailyRate = monthlyLateFee / 30;
  return Math.round(dailyRate * daysOverdue * 100) / 100;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(amount);
}

export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
