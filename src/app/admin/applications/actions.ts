"use server";

import { db } from "@/db";
import { loanApplications, loans, repaymentSchedules, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getSessionUser } from "@/lib/auth";
import { calculateEMI, generateRepaymentSchedule, generateLoanNumber } from "@/lib/loans";

export interface ActionResult {
  success: boolean;
  error?: string;
}

export async function approveApplication(
  applicationId: number,
  formData: FormData
): Promise<ActionResult> {
  try {
    const user = await getSessionUser();
    if (user.role !== "admin") {
      return { success: false, error: "Unauthorized" };
    }

    const disbursedAmount = parseFloat(formData.get("disbursedAmount") as string);
    const interestRate = parseFloat(formData.get("interestRate") as string);
    const disbursedDateStr = formData.get("disbursedDate") as string;
    const remarks = formData.get("remarks") as string;

    if (!disbursedAmount || !interestRate || !disbursedDateStr) {
      return { success: false, error: "All fields are required" };
    }

    // Get application details
    const applications = await db
      .select()
      .from(loanApplications)
      .where(eq(loanApplications.id, applicationId))
      .limit(1);

    if (applications.length === 0) {
      return { success: false, error: "Application not found" };
    }

    const application = applications[0];

    // Calculate EMI and total payable
    const emi = calculateEMI(disbursedAmount, interestRate, application.requestedTenure);
    const totalPayable = emi * application.requestedTenure;

    // Generate loan number
    const loanNumber = generateLoanNumber();
    const disbursedDate = new Date(disbursedDateStr);

    // Begin transaction
    await db.transaction(async (tx) => {
      // Update application status
      await tx
        .update(loanApplications)
        .set({
          status: "approved",
          remarks: remarks || null,
          reviewedBy: user.id,
          reviewedAt: new Date(),
        })
        .where(eq(loanApplications.id, applicationId));

      // Create loan record
      const loanResult = await tx.insert(loans).values({
        loanNumber,
        applicationId,
        userId: application.userId,
        productId: application.productId,
        principalAmount: disbursedAmount,
        interestRate,
        tenure: application.requestedTenure,
        emiAmount: emi,
        totalPayable,
        outstandingBalance: totalPayable,
        disbursedAmount,
        disbursedDate,
        status: "active",
      });

      // Get the loan ID
      const loanId = Number((loanResult as any).lastInsertRowid);

      // Generate repayment schedule
      const schedule = generateRepaymentSchedule(
        disbursedAmount,
        interestRate,
        application.requestedTenure,
        emi,
        disbursedDate
      );

      // Insert all schedule rows
      for (const installment of schedule) {
        await tx.insert(repaymentSchedules).values({
          loanId: loanId,
          installmentNumber: installment.installmentNumber,
          dueDate: installment.dueDate,
          emiAmount: installment.emiAmount,
          principalAmount: installment.principalAmount,
          interestAmount: installment.interestAmount,
          paidAmount: 0,
          lateFee: 0,
          status: "pending",
        });
      }
    });

    return { success: true };
  } catch (error) {
    console.error("Approve application error:", error);
    return { success: false, error: "Failed to approve application" };
  }
}

export async function rejectApplication(
  applicationId: number,
  formData: FormData
): Promise<ActionResult> {
  try {
    const user = await getSessionUser();
    if (user.role !== "admin") {
      return { success: false, error: "Unauthorized" };
    }

    const remarks = formData.get("remarks") as string;

    if (!remarks) {
      return { success: false, error: "Reason for rejection is required" };
    }

    // Update application status
    await db
      .update(loanApplications)
      .set({
        status: "rejected",
        remarks,
        reviewedBy: user.id,
        reviewedAt: new Date(),
      })
      .where(eq(loanApplications.id, applicationId));

    return { success: true };
  } catch (error) {
    console.error("Reject application error:", error);
    return { success: false, error: "Failed to reject application" };
  }
}
