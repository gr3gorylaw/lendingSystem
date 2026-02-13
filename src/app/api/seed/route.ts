import { NextResponse } from "next/server";
import { db } from "@/db";
import { roles, users, loanProducts, settings } from "@/db/schema";
import { hashPassword } from "@/lib/auth";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    // Create roles
    const existingRoles = await db.select().from(roles);
    if (existingRoles.length === 0) {
      await db.insert(roles).values([
        { name: "admin", description: "System Administrator" },
        { name: "borrower", description: "Loan Borrower" },
      ]);
    }

    // Get role IDs
    const allRoles = await db.select().from(roles);
    const adminRoleRec = allRoles.find((r: any) => r.name === "admin");
    const borrowerRoleRec = allRoles.find((r: any) => r.name === "borrower");
    const adminRoleId = adminRoleRec?.id || 1;
    const borrowerRoleId = borrowerRoleRec?.id || 2;

    // Create admin user
    const adminExists = await db
      .select()
      .from(users)
      .where(eq(users.email, "admin@lending.com"));

    if (adminExists.length === 0) {
      const adminPassword = await hashPassword("admin123");
      await db.insert(users).values({
        name: "Admin User",
        email: "admin@lending.com",
        password: adminPassword,
        roleId: adminRoleId,
        isActive: true,
      });
    }

    // Create demo borrower
    const borrowerExists = await db
      .select()
      .from(users)
      .where(eq(users.email, "borrower@lending.com"));

    if (borrowerExists.length === 0) {
      const borrowerPassword = await hashPassword("borrower123");
      await db.insert(users).values({
        name: "Demo Borrower",
        email: "borrower@lending.com",
        password: borrowerPassword,
        roleId: borrowerRoleId,
        isActive: true,
      });
    }

    // Create sample loan products
    const productsExist = await db.select().from(loanProducts);
    if (productsExist.length === 0) {
      await db.insert(loanProducts).values([
        {
          name: "Personal Loan",
          description: "Unsecured personal loan for any purpose",
          minAmount: 10000,
          maxAmount: 500000,
          interestRate: 12,
          minTenure: 6,
          maxTenure: 60,
          processingFee: 1,
          lateFeePercentage: 2,
          isActive: true,
        },
        {
          name: "Business Loan",
          description: "Loan for business purposes",
          minAmount: 50000,
          maxAmount: 2000000,
          interestRate: 15,
          minTenure: 12,
          maxTenure: 84,
          processingFee: 2,
          lateFeePercentage: 2.5,
          isActive: true,
        },
        {
          name: "Home Loan",
          description: "Loan for purchasing or renovating home",
          minAmount: 100000,
          maxAmount: 10000000,
          interestRate: 8.5,
          minTenure: 60,
          maxTenure: 360,
          processingFee: 0.5,
          lateFeePercentage: 2,
          isActive: true,
        },
      ]);
    }

    // Create settings
    const settingsData = await db.select().from(settings);
    if (settingsData.length === 0) {
      await db.insert(settings).values([
        {
          key: "company_name",
          value: "Lending System",
        },
        {
          key: "late_fee_percentage",
          value: "2",
        },
        {
          key: "currency",
          value: "INR",
        },
      ]);
    }

    return NextResponse.json({
      success: true,
      message: "Database seeded successfully",
      adminEmail: "admin@lending.com",
      adminPassword: "admin123",
      borrowerEmail: "borrower@lending.com",
      borrowerPassword: "borrower123",
    });
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json(
      { success: false, error: "Seed failed" },
      { status: 500 }
    );
  }
}
