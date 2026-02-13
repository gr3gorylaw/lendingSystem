"use server";

import { db } from "@/db";
import { loanProducts } from "@/db/schema";

export interface ProductResult {
  success: boolean;
  error?: string;
}

export async function createProduct(formData: FormData): Promise<ProductResult> {
  try {
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const minAmount = parseFloat(formData.get("minAmount") as string);
    const maxAmount = parseFloat(formData.get("maxAmount") as string);
    const interestRate = parseFloat(formData.get("interestRate") as string);
    const minTenure = parseInt(formData.get("minTenure") as string);
    const maxTenure = parseInt(formData.get("maxTenure") as string);
    const processingFee = parseFloat(formData.get("processingFee") as string) || 0;
    const lateFeePercentage = parseFloat(formData.get("lateFeePercentage") as string) || 2;

    // Validation
    if (!name || !minAmount || !maxAmount || !interestRate || !minTenure || !maxTenure) {
      return { success: false, error: "All required fields must be filled" };
    }

    if (minAmount > maxAmount) {
      return { success: false, error: "Minimum amount cannot exceed maximum amount" };
    }

    if (minTenure > maxTenure) {
      return { success: false, error: "Minimum tenure cannot exceed maximum tenure" };
    }

    await db.insert(loanProducts).values({
      name,
      description: description || null,
      minAmount,
      maxAmount,
      interestRate,
      minTenure,
      maxTenure,
      processingFee,
      lateFeePercentage,
    });

    return { success: true };
  } catch (error) {
    console.error("Create product error:", error);
    return { success: false, error: "Failed to create product" };
  }
}
