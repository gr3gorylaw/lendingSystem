import { db } from "@/db";
import { loanProducts } from "@/db/schema";
import { eq } from "drizzle-orm";
import { LoanApplicationForm } from "./loan-application-form";

export default async function ApplyPage() {
  // Get active loan products
  const products = await db
    .select()
    .from(loanProducts)
    .where(eq(loanProducts.isActive, true));

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Apply for Loan</h1>
        <p className="mt-1 text-sm text-gray-600">Select a loan product and submit your application</p>
      </div>

      {products.length === 0 ? (
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-12 text-center">
            <p className="text-sm text-gray-500">
              No loan products available at the moment. Please check back later.
            </p>
          </div>
        </div>
      ) : (
        <LoanApplicationForm products={products} />
      )}
    </div>
  );
}
