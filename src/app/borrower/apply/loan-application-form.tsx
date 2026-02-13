"use client";

import { useState, useEffect } from "react";
import { createApplication } from "./actions";
import { formatCurrency, calculateEMI, calculateTotalPayable } from "@/lib/loans";

interface Product {
  id: number;
  name: string;
  description: string | null;
  minAmount: number;
  maxAmount: number;
  interestRate: number;
  minTenure: number;
  maxTenure: number;
  processingFee: number;
}

export function LoanApplicationForm({ products }: { products: Product[] }) {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [amount, setAmount] = useState("");
  const [tenure, setTenure] = useState("");
  const [purpose, setPurpose] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [applicationNumber, setApplicationNumber] = useState("");

  // Calculate EMI preview
  const emiPreview = selectedProduct && amount && tenure
    ? calculateEMI(parseFloat(amount), selectedProduct.interestRate, parseInt(tenure))
    : 0;

  const totalPayable = selectedProduct && amount && tenure
    ? calculateTotalPayable(parseFloat(amount), selectedProduct.interestRate, parseInt(tenure))
    : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setLoading(true);

    if (!selectedProduct) {
      setError("Please select a loan product");
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append("productId", selectedProduct.id.toString());
    formData.append("amount", amount);
    formData.append("tenure", tenure);
    formData.append("purpose", purpose);

    const result = await createApplication(formData);

    if (result.success) {
      setSuccess(true);
      setApplicationNumber(result.applicationNumber || "");
    } else {
      setError(result.error || "Failed to submit application");
    }
    setLoading(false);
  };

  if (success) {
    return (
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-12 text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
            <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-lg leading-6 font-medium text-gray-900">Application Submitted!</h3>
          <p className="mt-2 text-sm text-gray-500">
            Your application number is: <span className="font-medium">{applicationNumber}</span>
          </p>
          <p className="mt-4 text-sm text-gray-500">
            You will be notified once your application is reviewed.
          </p>
          <div className="mt-6">
            <a
              href="/borrower/dashboard"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Go to Dashboard
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Product Selection */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Select Loan Product
          </h3>
        </div>
        <div className="px-4 py-5 sm:p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((product) => (
              <div
                key={product.id}
                onClick={() => {
                  setSelectedProduct(product);
                  setAmount("");
                  setTenure("");
                }}
                className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                  selectedProduct?.id === product.id
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <h4 className="font-medium text-gray-900">{product.name}</h4>
                {product.description && (
                  <p className="text-sm text-gray-500 mt-1">{product.description}</p>
                )}
                <div className="mt-3 space-y-1 text-sm text-gray-600">
                  <p>Amount: {formatCurrency(product.minAmount)} - {formatCurrency(product.maxAmount)}</p>
                  <p>Interest Rate: {product.interestRate}% p.a.</p>
                  <p>Tenure: {product.minTenure} - {product.maxTenure} months</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Application Details */}
      {selectedProduct && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Loan Details
            </h3>
          </div>
          <div className="px-4 py-5 sm:p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Loan Amount (₹)
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  min={selectedProduct.minAmount}
                  max={selectedProduct.maxAmount}
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder={`${selectedProduct.minAmount} - ${selectedProduct.maxAmount}`}
                />
                <p className="mt-1 text-xs text-gray-500">
                  Min: {formatCurrency(selectedProduct.minAmount)} | Max: {formatCurrency(selectedProduct.maxAmount)}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Tenure (months)
                </label>
                <input
                  type="number"
                  value={tenure}
                  onChange={(e) => setTenure(e.target.value)}
                  min={selectedProduct.minTenure}
                  max={selectedProduct.maxTenure}
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder={`${selectedProduct.minTenure} - ${selectedProduct.maxTenure}`}
                />
                <p className="mt-1 text-xs text-gray-500">
                  Min: {selectedProduct.minTenure} months | Max: {selectedProduct.maxTenure} months
                </p>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">
                  Purpose of Loan
                </label>
                <textarea
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  rows={3}
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Describe the purpose of your loan"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* EMI Preview */}
      {selectedProduct && amount && tenure && emiPreview > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h4 className="text-lg font-medium text-blue-900 mb-4">EMI Preview</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-blue-700">Loan Amount</p>
              <p className="text-lg font-semibold text-blue-900">{formatCurrency(parseFloat(amount))}</p>
            </div>
            <div>
              <p className="text-sm text-blue-700">Interest Rate</p>
              <p className="text-lg font-semibold text-blue-900">{selectedProduct.interestRate}%</p>
            </div>
            <div>
              <p className="text-sm text-blue-700">Tenure</p>
              <p className="text-lg font-semibold text-blue-900">{tenure} months</p>
            </div>
            <div>
              <p className="text-sm text-blue-700">Monthly EMI</p>
              <p className="text-lg font-semibold text-blue-900">{formatCurrency(emiPreview)}</p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-blue-200">
            <p className="text-sm text-blue-700">Total Payable: <span className="font-semibold">{formatCurrency(totalPayable)}</span></p>
          </div>
        </div>
      )}

      {/* Submit Button */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading || !selectedProduct}
          className="px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Submitting..." : "Submit Application"}
        </button>
      </div>
    </form>
  );
}
