"use client";

import { useState } from "react";
import { createProduct } from "./actions";

export function ProductForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const result = await createProduct(formData);

    if (result.success) {
      setSuccess(true);
      (e.target as HTMLFormElement).reset();
    } else {
      setError(result.error || "Failed to create product");
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
          Product created successfully!
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Product Name
          </label>
          <input
            type="text"
            name="name"
            id="name"
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="e.g., Personal Loan"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <input
            type="text"
            name="description"
            id="description"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="Brief description"
          />
        </div>

        <div>
          <label htmlFor="minAmount" className="block text-sm font-medium text-gray-700">
            Minimum Amount (₹)
          </label>
          <input
            type="number"
            name="minAmount"
            id="minAmount"
            required
            min="0"
            step="0.01"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="10000"
          />
        </div>

        <div>
          <label htmlFor="maxAmount" className="block text-sm font-medium text-gray-700">
            Maximum Amount (₹)
          </label>
          <input
            type="number"
            name="maxAmount"
            id="maxAmount"
            required
            min="0"
            step="0.01"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="500000"
          />
        </div>

        <div>
          <label htmlFor="interestRate" className="block text-sm font-medium text-gray-700">
            Annual Interest Rate (%)
          </label>
          <input
            type="number"
            name="interestRate"
            id="interestRate"
            required
            min="0"
            max="100"
            step="0.01"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="12"
          />
        </div>

        <div>
          <label htmlFor="minTenure" className="block text-sm font-medium text-gray-700">
            Minimum Tenure (months)
          </label>
          <input
            type="number"
            name="minTenure"
            id="minTenure"
            required
            min="1"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="6"
          />
        </div>

        <div>
          <label htmlFor="maxTenure" className="block text-sm font-medium text-gray-700">
            Maximum Tenure (months)
          </label>
          <input
            type="number"
            name="maxTenure"
            id="maxTenure"
            required
            min="1"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="60"
          />
        </div>

        <div>
          <label htmlFor="processingFee" className="block text-sm font-medium text-gray-700">
            Processing Fee (%)
          </label>
          <input
            type="number"
            name="processingFee"
            id="processingFee"
            required
            min="0"
            max="100"
            step="0.01"
            defaultValue="0"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="1"
          />
        </div>

        <div>
          <label htmlFor="lateFeePercentage" className="block text-sm font-medium text-gray-700">
            Late Fee (% per month)
          </label>
          <input
            type="number"
            name="lateFeePercentage"
            id="lateFeePercentage"
            required
            min="0"
            max="100"
            step="0.01"
            defaultValue="2"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="2"
          />
        </div>
      </div>

      <div className="pt-4">
        <button
          type="submit"
          disabled={loading}
          className="w-full sm:w-auto px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {loading ? "Creating..." : "Create Product"}
        </button>
      </div>
    </form>
  );
}
