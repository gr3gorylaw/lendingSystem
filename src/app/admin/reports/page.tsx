import { db } from "@/db";
import { loans, loanApplications, users, payments, repaymentSchedules, loanProducts } from "@/db/schema";
import { eq, desc, sql, and, gte, lte } from "drizzle-orm";
import { formatCurrency, formatDate } from "@/lib/loans";

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: { type?: string; startDate?: string; endDate?: string };
}) {
  const reportType = searchParams.type || "loan_register";
  const startDate = searchParams.startDate ? new Date(searchParams.startDate) : null;
  const endDate = searchParams.endDate ? new Date(searchParams.endDate) : null;

  let reportData: any[] = [];
  let summary: any = {};

  if (reportType === "loan_register") {
    reportData = await db
      .select({
        loanNumber: loans.loanNumber,
        userName: users.name,
        userEmail: users.email,
        productName: loanProducts.name,
        principalAmount: loans.principalAmount,
        interestRate: loans.interestRate,
        tenure: loans.tenure,
        emiAmount: loans.emiAmount,
        totalPayable: loans.totalPayable,
        outstandingBalance: loans.outstandingBalance,
        disbursedDate: loans.disbursedDate,
        status: loans.status,
      })
      .from(loans)
      .innerJoin(users, eq(loans.userId, users.id))
      .innerJoin(loanProducts, eq(loans.productId, loanProducts.id))
      .orderBy(desc(loans.createdAt));
  } else if (reportType === "collection") {
    reportData = await db
      .select({
        paymentNumber: payments.paymentNumber,
        loanNumber: loans.loanNumber,
        userName: users.name,
        amount: payments.amount,
        paymentMethod: payments.paymentMethod,
        paymentType: payments.paymentType,
        createdAt: payments.createdAt,
      })
      .from(payments)
      .innerJoin(loans, eq(payments.loanId, loans.id))
      .innerJoin(users, eq(payments.userId, users.id))
      .orderBy(desc(payments.createdAt));
  } else if (reportType === "overdue") {
    reportData = await db
      .select({
        loanNumber: loans.loanNumber,
        userName: users.name,
        userEmail: users.email,
        emiAmount: repaymentSchedules.emiAmount,
        dueDate: repaymentSchedules.dueDate,
        paidAmount: repaymentSchedules.paidAmount,
        lateFee: repaymentSchedules.lateFee,
      })
      .from(repaymentSchedules)
      .innerJoin(loans, eq(repaymentSchedules.loanId, loans.id))
      .innerJoin(users, eq(loans.userId, users.id))
      .where(eq(repaymentSchedules.status, "overdue"));
  }

  // Get summary stats
  if (reportType === "loan_register") {
    const totalDisbursed = await db
      .select({ sum: sql<number>`COALESCE(SUM(${loans.disbursedAmount}), 0)` })
      .from(loans);
    const totalOutstanding = await db
      .select({ sum: sql<number>`COALESCE(SUM(${loans.outstandingBalance}), 0)` })
      .from(loans);
    const activeLoans = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(loans)
      .where(eq(loans.status, "active"));

    summary = {
      totalLoans: reportData.length,
      totalDisbursed: totalDisbursed[0]?.sum || 0,
      totalOutstanding: totalOutstanding[0]?.sum || 0,
      activeLoans: activeLoans[0]?.count || 0,
    };
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
        <p className="mt-1 text-sm text-gray-600">Generate and view system reports</p>
      </div>

      {/* Report Filters */}
      <div className="bg-white shadow rounded-lg mb-6">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <form className="flex flex-wrap gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700">Report Type</label>
              <select
                name="type"
                defaultValue={reportType}
                className="mt-1 block w-48 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="loan_register">Loan Register</option>
                <option value="collection">Collection Report</option>
                <option value="overdue">Overdue Report</option>
              </select>
            </div>
            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              Generate Report
            </button>
          </form>
        </div>
      </div>

      {/* Summary Cards */}
      {reportType === "loan_register" && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-sm text-gray-500">Total Loans</div>
            <div className="text-2xl font-bold">{summary.totalLoans}</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-sm text-gray-500">Active Loans</div>
            <div className="text-2xl font-bold">{summary.activeLoans}</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-sm text-gray-500">Total Disbursed</div>
            <div className="text-2xl font-bold">{formatCurrency(summary.totalDisbursed)}</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-sm text-gray-500">Total Outstanding</div>
            <div className="text-2xl font-bold">{formatCurrency(summary.totalOutstanding)}</div>
          </div>
        </div>
      )}

      {/* Report Data */}
      <div className="bg-white shadow rounded-lg">
        {reportData.length === 0 ? (
          <div className="px-4 py-12 text-center">
            <p className="text-sm text-gray-500">No data available</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {reportType === "loan_register" && (
                    <>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Loan #</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Borrower</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Disbursed</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">EMI</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Outstanding</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    </>
                  )}
                  {reportType === "collection" && (
                    <>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment #</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Loan #</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Borrower</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Method</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    </>
                  )}
                  {reportType === "overdue" && (
                    <>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Loan #</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Borrower</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">EMI Due</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Late Fee</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {reportData.map((row, idx) => (
                  <tr key={idx}>
                    {reportType === "loan_register" && (
                      <>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{row.loanNumber}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{row.userName}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{row.productName}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(row.principalAmount)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(row.emiAmount)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{formatCurrency(row.outstandingBalance)}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${row.status === "active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}>
                            {row.status}
                          </span>
                        </td>
                      </>
                    )}
                    {reportType === "collection" && (
                      <>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{row.paymentNumber}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{row.loanNumber}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{row.userName}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{formatCurrency(row.amount)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{row.paymentMethod}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(row.createdAt)}</td>
                      </>
                    )}
                    {reportType === "overdue" && (
                      <>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{row.loanNumber}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{row.userName}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{formatCurrency(row.emiAmount)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">{formatDate(row.dueDate)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-red-600">{formatCurrency(row.lateFee)}</td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
