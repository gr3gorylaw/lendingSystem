import { db } from "@/db";
import { loanApplications, loans, users, loanProducts } from "@/db/schema";
import { eq, count, and, gte, lte, sql } from "drizzle-orm";
import { formatCurrency } from "@/lib/loans";

export default async function AdminDashboard() {
  // Get stats
  const totalApplications = await db
    .select({ count: count() })
    .from(loanApplications);

  const pendingApplications = await db
    .select({ count: count() })
    .from(loanApplications)
    .where(eq(loanApplications.status, "pending"));

  const totalLoans = await db
    .select({ count: count() })
    .from(loans);

  const activeLoans = await db
    .select({ count: count() })
    .from(loans)
    .where(eq(loans.status, "active"));

  const totalBorrowers = await db
    .select({ count: count() })
    .from(users);

  const totalDisbursed = await db
    .select({ sum: sql<number>`COALESCE(SUM(${loans.disbursedAmount}), 0)` })
    .from(loans)
    .where(eq(loans.status, "active"));

  const totalOutstanding = await db
    .select({ sum: sql<number>`COALESCE(SUM(${loans.outstandingBalance}), 0)` })
    .from(loans)
    .where(eq(loans.status, "active"));

  const recentApplications = await db
    .select()
    .from(loanApplications)
    .orderBy(loanApplications.createdAt)
    .limit(5);

  const recentLoans = await db
    .select()
    .from(loans)
    .orderBy(loans.createdAt)
    .limit(5);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="mt-1 text-sm text-gray-600">Overview of your lending operations</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">Pending Applications</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">
              {pendingApplications[0]?.count || 0}
            </dd>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">Active Loans</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">
              {activeLoans[0]?.count || 0}
            </dd>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">Total Disbursed</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">
              {formatCurrency(totalDisbursed[0]?.sum || 0)}
            </dd>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">Total Outstanding</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">
              {formatCurrency(totalOutstanding[0]?.sum || 0)}
            </dd>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Applications */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Recent Applications
            </h3>
          </div>
          <div className="px-4 py-5 sm:p-6">
            {recentApplications.length === 0 ? (
              <p className="text-sm text-gray-500">No applications yet</p>
            ) : (
              <ul className="divide-y divide-gray-200">
                {recentApplications.map((app) => (
                  <li key={app.id} className="py-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {app.applicationNumber}
                        </p>
                        <p className="text-sm text-gray-500">
                          Amount: {formatCurrency(app.requestedAmount)}
                        </p>
                      </div>
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          app.status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : app.status === "approved"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {app.status}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Recent Loans */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Recent Loans
            </h3>
          </div>
          <div className="px-4 py-5 sm:p-6">
            {recentLoans.length === 0 ? (
              <p className="text-sm text-gray-500">No loans yet</p>
            ) : (
              <ul className="divide-y divide-gray-200">
                {recentLoans.map((loan) => (
                  <li key={loan.id} className="py-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {loan.loanNumber}
                        </p>
                        <p className="text-sm text-gray-500">
                          EMI: {formatCurrency(loan.emiAmount)}
                        </p>
                      </div>
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
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
