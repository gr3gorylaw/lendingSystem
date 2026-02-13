import { db } from "@/db";
import { loans, users, loanProducts } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { formatCurrency, formatDate } from "@/lib/loans";
import { PaymentForm } from "./payment-form";

export default async function LoansPage() {
  const allLoans = await db
    .select({
      id: loans.id,
      loanNumber: loans.loanNumber,
      userId: loans.userId,
      productId: loans.productId,
      principalAmount: loans.principalAmount,
      interestRate: loans.interestRate,
      tenure: loans.tenure,
      emiAmount: loans.emiAmount,
      totalPayable: loans.totalPayable,
      outstandingBalance: loans.outstandingBalance,
      disbursedAmount: loans.disbursedAmount,
      disbursedDate: loans.disbursedDate,
      status: loans.status,
      createdAt: loans.createdAt,
      userName: users.name,
      userEmail: users.email,
      productName: loanProducts.name,
    })
    .from(loans)
    .innerJoin(users, eq(loans.userId, users.id))
    .innerJoin(loanProducts, eq(loans.productId, loanProducts.id))
    .orderBy(desc(loans.createdAt));

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Loans</h1>
        <p className="mt-1 text-sm text-gray-600">Manage active loans and record payments</p>
      </div>

      {/* Loans List */}
      <div className="bg-white shadow rounded-lg">
        {allLoans.length === 0 ? (
          <div className="px-4 py-12 text-center">
            <p className="text-sm text-gray-500">No loans yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Loan #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Borrower
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Disbursed
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    EMI
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Outstanding
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {allLoans.map((loan) => (
                  <tr key={loan.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {loan.loanNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div>{loan.userName}</div>
                      <div className="text-xs text-gray-400">{loan.userEmail}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {loan.productName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(loan.disbursedAmount || 0)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(loan.emiAmount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                      {formatCurrency(loan.outstandingBalance)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          loan.status === "active"
                            ? "bg-green-100 text-green-800"
                            : loan.status === "closed"
                            ? "bg-gray-100 text-gray-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {loan.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <PaymentForm loan={loan} />
                    </td>
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
