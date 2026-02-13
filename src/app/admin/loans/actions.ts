"use server";

import { db } from "@/db";
import { loans, repaymentSchedules, payments } from "@/db/schema";
import { eq, and, lte } from "drizzle-orm";
import { getSessionUser } from "@/lib/auth";
import { generatePaymentNumber } from "@/lib/loans";

export interface PaymentResult {
  success: boolean;
  error?: string;
}

export async function recordPayment(
  loanId: number,
  formData: FormData
): Promise<PaymentResult> {
  try {
    const user = await getSessionUser();
    if (user.role !== "admin") {
      return { success: false, error: "Unauthorized" };
    }

    const amount = parseFloat(formData.get("amount") as string);
    const paymentMethod = formData.get("paymentMethod") as string;
    const transactionId = formData.get("transactionId") as string;
    const remarks = formData.get("remarks") as string;

    if (!amount || amount <= 0) {
      return { success: false, error: "Valid payment amount is required" };
    }

    // Get loan details
    const loanRecords = await db
      .select()
      .from(loans)
      .where(eq(loans.id, loanId))
      .limit(1);

    if (loanRecords.length === 0) {
      return { success: false, error: "Loan not found" };
    }

    const loan = loanRecords[0];

    // Get earliest pending EMI
    const pendingSchedule = await db
      .select()
      .from(repaymentSchedules)
      .where(
        and(
          eq(repaymentSchedules.loanId, loanId),
          eq(repaymentSchedules.status, "pending")
        )
      )
      .orderBy(repaymentSchedules.dueDate)
      .limit(1);

    // Generate payment number
    const paymentNumber = generatePaymentNumber();

    await db.transaction(async (tx) => {
      if (pendingSchedule.length > 0) {
        const schedule = pendingSchedule[0];
        let paidAmount = amount;
        let paymentType = "emi";
        let scheduleId = schedule.id;

        // Determine allocation
        if (amount >= schedule.emiAmount) {
          // Full EMI payment
          await tx
            .update(repaymentSchedules)
            .set({
              status: "paid",
              paidAmount: schedule.emiAmount,
              paidDate: new Date(),
            })
            .where(eq(repaymentSchedules.id, schedule.id));

          paidAmount = amount - schedule.emiAmount;
        } else {
          // Partial payment
          await tx
            .update(repaymentSchedules)
            .set({
              paidAmount: amount,
            })
            .where(eq(repaymentSchedules.id, schedule.id));
        }

        // If there's excess payment, treat as advance
        if (paidAmount > 0) {
          paymentType = "partial";
        }

        // Insert payment record
        await tx.insert(payments).values({
          paymentNumber,
          loanId,
          scheduleId,
          userId: loan.userId,
          amount,
          paymentMethod,
          transactionId: transactionId || null,
          paymentType,
          remarks: remarks || null,
          recordedBy: user.id,
        });
      } else {
        // No pending EMI - treat as advance payment
        await tx.insert(payments).values({
          paymentNumber,
          loanId,
          userId: loan.userId,
          amount,
          paymentMethod,
          transactionId: transactionId || null,
          paymentType: "advance",
          remarks: remarks || null,
          recordedBy: user.id,
        });
      }

      // Update loan outstanding balance
      const newOutstanding = Math.max(0, loan.outstandingBalance - amount);
      const newStatus = newOutstanding <= 0 ? "closed" : "active";

      await tx
        .update(loans)
        .set({
          outstandingBalance: newOutstanding,
          status: newStatus,
        })
        .where(eq(loans.id, loanId));
    });

    return { success: true };
  } catch (error) {
    console.error("Record payment error:", error);
    return { success: false, error: "Failed to record payment" };
  }
}
