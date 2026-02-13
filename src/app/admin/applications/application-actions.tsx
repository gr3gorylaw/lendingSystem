"use client";

import { useState } from "react";
import { approveApplication, rejectApplication } from "./actions";

interface Application {
  id: number;
  applicationNumber: string;
  userId: number;
  productId: number;
  requestedAmount: number;
  requestedTenure: number;
  purpose: string | null;
  userName: string;
  userEmail: string;
  productName: string;
  interestRate: number;
}

export function ApplicationActions({ application }: { application: Application }) {
  const [showApprove, setShowApprove] = useState(false);
  const [showReject, setShowReject] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleApprove = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const result = await approveApplication(application.id, formData);

    if (result.success) {
      setSuccess(true);
      window.location.reload();
    } else {
      setError(result.error || "Failed to approve application");
    }
    setLoading(false);
  };

  const handleReject = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const result = await rejectApplication(application.id, formData);

    if (result.success) {
      setSuccess(true);
      window.location.reload();
    } else {
      setError(result.error || "Failed to reject application");
    }
    setLoading(false);
  };

  if (success) {
    return <span className="text-green-600 text-sm">Processed!</span>;
  }

  return (
    <div className="flex justify-end gap-2">
      <button
        onClick={() => setShowApprove(!showApprove)}
        className="text-blue-600 hover:text-blue-900 text-sm font-medium"
      >
        Approve
      </button>
      <button
        onClick={() => setShowReject(!showReject)}
        className="text-red-600 hover:text-red-900 text-sm font-medium"
      >
        Reject
      </button>

      {/* Approve Modal */}
      {showApprove && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Approve & Disburse Loan
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Applicant: {application.userName} ({application.userEmail})
            </p>
            <p className="text-sm text-gray-500 mb-4">
              Amount: ₹{application.requestedAmount.toLocaleString()} | Tenure: {application.requestedTenure} months
            </p>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded mb-4 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleApprove}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Disbursed Amount (₹)
                  </label>
                  <input
                    type="number"
                    name="disbursedAmount"
                    required
                    defaultValue={application.requestedAmount}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Interest Rate (%)
                  </label>
                  <input
                    type="number"
                    name="interestRate"
                    required
                    step="0.01"
                    defaultValue={application.interestRate}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Disbursal Date
                  </label>
                  <input
                    type="date"
                    name="disbursedDate"
                    required
                    defaultValue={new Date().toISOString().split("T")[0]}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Remarks
                  </label>
                  <textarea
                    name="remarks"
                    rows={2}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Optional remarks"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowApprove(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? "Processing..." : "Approve & Disburse"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showReject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Reject Application
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Application: {application.applicationNumber}
            </p>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded mb-4 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleReject}>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Reason for Rejection
                </label>
                <textarea
                  name="remarks"
                  required
                  rows={3}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                  placeholder="Please provide a reason"
                />
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowReject(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50"
                >
                  {loading ? "Processing..." : "Reject Application"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
