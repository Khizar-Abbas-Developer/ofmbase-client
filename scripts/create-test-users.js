import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables");
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const TEST_USERS = [
  {
    email: "test.agency@example.com",
    password: "Test123!@#",
    type: "agency",
  },
  {
    email: "test.creator@example.com",
    password: "Test123!@#",
    type: "creator",
  },
  {
    email: "test.employee@example.com",
    password: "Test123!@#",
    type: "employee",
  },
];

async function createTestUser(email, password) {
  try {
    // Check if user exists
    const { data: existingUser } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (existingUser) {
      console.log(`User ${email} already exists, skipping...`);
      return;
    }

    // Create new user
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) throw error;

    return data.user;
  } catch (error) {
    console.error(`Failed to create user ${email}:`, error.message);
    throw error;
  }
}

async function createTestUsers() {
  try {
    console.log("Creating test users...");

    for (const user of TEST_USERS) {
      await createTestUser(user.email, user.password);
      // Wait a bit between users to allow trigger to complete
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }

    console.log("All test users created successfully!");
  } catch (error) {
    console.error("Failed to create test users:", error);
    process.exit(1);
  }
}

createTestUsers();
