"use client";

import { useState } from "react";
import { recordPayment } from "./actions";
import { formatCurrency } from "@/lib/loans";

interface Loan {
  id: number;
  loanNumber: string;
  userName: string;
  emiAmount: number;
  outstandingBalance: number;
}

export function PaymentForm({ loan }: { loan: Loan }) {
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const result = await recordPayment(loan.id, formData);

    if (result.success) {
      setSuccess(true);
      window.location.reload();
    } else {
      setError(result.error || "Failed to record payment");
    }
    setLoading(false);
  };

  if (success) {
    return <span className="text-green-600 text-sm">Payment recorded!</span>;
  }

  return (
    <>
      <button
        onClick={() => setShowForm(true)}
        className="text-blue-600 hover:text-blue-900 text-sm font-medium"
      >
        Record Payment
      </button>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Record Payment
            </h3>
            <p className="text-sm text-gray-500 mb-2">
              Loan: {loan.loanNumber}
            </p>
            <p className="text-sm text-gray-500 mb-4">
              Borrower: {loan.userName}
            </p>
            <p className="text-sm text-gray-500 mb-4">
              Outstanding: {formatCurrency(loan.outstandingBalance)} | EMI: {formatCurrency(loan.emiAmount)}
            </p>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded mb-4 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Payment Amount (₹)
                  </label>
                  <input
                    type="number"
                    name="amount"
                    required
                    min="0"
                    step="0.01"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Enter amount"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Payment Method
                  </label>
                  <select
                    name="paymentMethod"
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    <option value="cash">Cash</option>
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="cheque">Cheque</option>
                    <option value="upi">UPI</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Transaction ID (Optional)
                  </label>
                  <input
                    type="text"
                    name="transactionId"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Transaction reference"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Remarks (Optional)
                  </label>
                  <textarea
                    name="remarks"
                    rows={2}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Additional notes"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? "Recording..." : "Record Payment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
