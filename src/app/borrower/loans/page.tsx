import { db } from "@/db";
import { loans, loanProducts, repaymentSchedules } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { getSessionUser } from "@/lib/auth";
import { formatCurrency, formatDate } from "@/lib/loans";
import Link from "next/link";

export default async function BorrowerLoansPage() {
  const user = await getSessionUser();

  const userLoans = await db
    .select({
      id: loans.id,
      loanNumber: loans.loanNumber,
      productId: loans.productId,
      principalAmount: loans.principalAmount,
      interestRate: loans.interestRate,
      tenure: loans.tenure,
      emiAmount: loans.emiAmount,
      totalPayable: loans.totalPayable,
      outstandingBalance: loans.outstandingBalance,
      disbursedDate: loans.disbursedDate,
      status: loans.status,
      createdAt: loans.createdAt,
      productName: loanProducts.name,
    })
    .from(loans)
    .innerJoin(loanProducts, eq(loans.productId, loanProducts.id))
    .where(eq(loans.userId, user.id))
    .orderBy(desc(loans.createdAt));

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">My Loans</h1>
        <p className="mt-1 text-sm text-gray-600">View your active loans and repayment schedules</p>
      </div>

      {userLoans.length === 0 ? (
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-12 text-center">
            <p className="text-sm text-gray-500 mb-4">You don&apos;t have any loans yet.</p>
            <Link
              href="/borrower/apply"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Apply for Loan
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {userLoans.map((loan) => (
            <div key={loan.id} className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      {loan.loanNumber}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {loan.productName} | Disbursed: {loan.disbursedDate ? formatDate(loan.disbursedDate) : "N/A"}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 text-sm font-medium rounded-full ${
                      loan.status === "active"
                        ? "bg-green-100 text-green-800"
                        : loan.status === "closed"
                        ? "bg-gray-100 text-gray-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {loan.status}
                  </span>
                </div>
              </div>
              <div className="px-4 py-5 sm:p-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Principal Amount</p>
                    <p className="text-lg font-semibold text-gray-900">{formatCurrency(loan.principalAmount)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Interest Rate</p>
                    <p className="text-lg font-semibold text-gray-900">{loan.interestRate}%</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Monthly EMI</p>
                    <p className="text-lg font-semibold text-gray-900">{formatCurrency(loan.emiAmount)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Outstanding</p>
                    <p className="text-lg font-semibold text-gray-900">{formatCurrency(loan.outstandingBalance)}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
