import { db } from "@/db";
import { loanApplications, users, loanProducts } from "@/db/schema";
import { eq } from "drizzle-orm";
import { formatCurrency, formatDate } from "@/lib/loans";
import { ApplicationActions } from "./application-actions";

export default async function ApplicationsPage({
  searchParams,
}: {
  searchParams: { status?: string };
}) {
  const statusFilter = searchParams.status || "pending";

  const applications = await db
    .select({
      id: loanApplications.id,
      applicationNumber: loanApplications.applicationNumber,
      userId: loanApplications.userId,
      productId: loanApplications.productId,
      requestedAmount: loanApplications.requestedAmount,
      requestedTenure: loanApplications.requestedTenure,
      purpose: loanApplications.purpose,
      status: loanApplications.status,
      remarks: loanApplications.remarks,
      createdAt: loanApplications.createdAt,
      userName: users.name,
      userEmail: users.email,
      productName: loanProducts.name,
      interestRate: loanProducts.interestRate,
    })
    .from(loanApplications)
    .innerJoin(users, eq(loanApplications.userId, users.id))
    .innerJoin(loanProducts, eq(loanApplications.productId, loanProducts.id))
    .where(eq(loanApplications.status, statusFilter))
    .orderBy(loanApplications.createdAt);

  const counts = {
    pending: await db.select({ count: loanApplications.id }).from(loanApplications).where(eq(loanApplications.status, "pending")),
    approved: await db.select({ count: loanApplications.id }).from(loanApplications).where(eq(loanApplications.status, "approved")),
    rejected: await db.select({ count: loanApplications.id }).from(loanApplications).where(eq(loanApplications.status, "rejected")),
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Loan Applications</h1>
        <p className="mt-1 text-sm text-gray-600">Review and manage loan applications</p>
      </div>

      {/* Status Tabs */}
      <div className="mb-6">
        <nav className="-mb-px flex space-x-8">
          <a
            href="/admin/applications?status=pending"
            className={`${
              statusFilter === "pending"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Pending ({counts.pending[0]?.count || 0})
          </a>
          <a
            href="/admin/applications?status=approved"
            className={`${
              statusFilter === "approved"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Approved ({counts.approved[0]?.count || 0})
          </a>
          <a
            href="/admin/applications?status=rejected"
            className={`${
              statusFilter === "rejected"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Rejected ({counts.rejected[0]?.count || 0})
          </a>
        </nav>
      </div>

      {/* Applications List */}
      <div className="bg-white shadow rounded-lg">
        {applications.length === 0 ? (
          <div className="px-4 py-12 text-center">
            <p className="text-sm text-gray-500">No {statusFilter} applications</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Application #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Borrower
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tenure
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  {statusFilter === "pending" && (
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {applications.map((app) => (
                  <tr key={app.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {app.applicationNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div>{app.userName}</div>
                      <div className="text-xs text-gray-400">{app.userEmail}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {app.productName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(app.requestedAmount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {app.requestedTenure} months
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(app.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
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
                    </td>
                    {statusFilter === "pending" && (
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <ApplicationActions application={app} />
                      </td>
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
