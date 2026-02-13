"use server";

import { db } from "@/db";
import { loanApplications } from "@/db/schema";
import { getSessionUser } from "@/lib/auth";
import { generateApplicationNumber } from "@/lib/loans";

export interface ApplicationResult {
  success: boolean;
  error?: string;
  applicationNumber?: string;
}

export async function createApplication(formData: FormData): Promise<ApplicationResult> {
  try {
    const user = await getSessionUser();
    if (user.role !== "borrower") {
      return { success: false, error: "Unauthorized" };
    }

    const productId = parseInt(formData.get("productId") as string);
    const amount = parseFloat(formData.get("amount") as string);
    const tenure = parseInt(formData.get("tenure") as string);
    const purpose = formData.get("purpose") as string;

    // Validation
    if (!productId || !amount || !tenure || !purpose) {
      return { success: false, error: "All fields are required" };
    }

    // Generate application number
    const applicationNumber = generateApplicationNumber();

    // Create application
    await db.insert(loanApplications).values({
      applicationNumber,
      userId: user.id,
      productId,
      requestedAmount: amount,
      requestedTenure: tenure,
      purpose,
      status: "pending",
    });

    return { success: true, applicationNumber };
  } catch (error) {
    console.error("Create application error:", error);
    return { success: false, error: "Failed to submit application" };
  }
}
