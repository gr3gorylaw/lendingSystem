"use server";

import { db } from "@/db";
import { users, roles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { hashPassword, verifyPassword, createSession, destroySession } from "@/lib/auth";

export interface RegisterResult {
  success: boolean;
  error?: string;
}

export interface LoginResult {
  success: boolean;
  error?: string;
  redirect?: string;
}

export async function register(
  name: string,
  email: string,
  password: string
): Promise<RegisterResult> {
  try {
    // Validate input
    if (!name || !email || !password) {
      return { success: false, error: "All fields are required" };
    }

    if (password.length < 6) {
      return { success: false, error: "Password must be at least 6 characters" };
    }

    // Check if email already exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email.toLowerCase()))
      .limit(1);

    if (existingUser.length > 0) {
      return { success: false, error: "Email already registered" };
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Get borrower role (role_id = 2)
    const borrowerRole = await db
      .select()
      .from(roles)
      .where(eq(roles.name, "borrower"))
      .limit(1);

    const roleId = borrowerRole.length > 0 ? borrowerRole[0].id : 2;

    // Create user
    await db.insert(users).values({
      name,
      email: email.toLowerCase(),
      password: passwordHash,
      roleId,
    });

    return { success: true };
  } catch (error) {
    console.error("Registration error:", error);
    return { success: false, error: "Registration failed. Please try again." };
  }
}

export async function login(
  email: string,
  password: string
): Promise<LoginResult> {
  try {
    // Validate input
    if (!email || !password) {
      return { success: false, error: "Email and password are required" };
    }

    console.log("Login attempt for:", email.toLowerCase());

    // Find user by email
    const userRecords = await db
      .select()
      .from(users)
      .where(eq(users.email, email.toLowerCase()))
      .limit(1);

    console.log("User records found:", userRecords.length);

    if (userRecords.length === 0) {
      console.log("User not found in database");
      return { success: false, error: "Invalid email or password" };
    }

    const user = userRecords[0];
    console.log("User found, checking password...");

    // Verify password
    const isValidPassword = await verifyPassword(password, user.password);
    console.log("Password valid:", isValidPassword);
    
    if (!isValidPassword) {
      return { success: false, error: "Invalid email or password" };
    }

    // Check if user is active
    if (!user.isActive) {
      return { success: false, error: "Account is deactivated" };
    }

    // Get role
    const roleRecords = await db
      .select()
      .from(roles)
      .where(eq(roles.id, user.roleId))
      .limit(1);

    const role = roleRecords.length > 0 ? roleRecords[0].name : "borrower";

    // Create session
    await createSession(user.id);

    // Redirect based on role
    const redirect = role === "admin" ? "/admin/dashboard" : "/borrower/dashboard";

    return { success: true, redirect };
  } catch (error) {
    console.error("Login error:", error);
    const err = error as Error;
    if (err.message?.includes("cookies")) {
      return { success: false, error: "Session error. Please try again." };
    }
    return { success: false, error: "Login failed. Please try again." };
  }
}

export async function logout(): Promise<void> {
  await destroySession();
}
