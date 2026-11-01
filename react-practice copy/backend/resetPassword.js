
import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import User from "./models/User.js";

dotenv.config();

const rl = readline.createInterface({ input, output });

try {
  const email = (
    await rl.question("Enter your registered email: ")
  ).trim().toLowerCase();

  const password = await rl.question(
    "Enter your NEW password (minimum 8 characters): "
  );

  if (!email || password.length < 8 || password.length > 72) {
    throw new Error("Email is required; password must be 8–72 characters.");
  }

  await mongoose.connect(process.env.MONGO_URI);

  const user = await User.findOne({ email }).select("_id");

  if (!user) {
    throw new Error("No account found with that email.");
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  await User.updateOne(
    { _id: user._id },
    { $set: { password: hashedPassword } }
  );

  console.log("Password reset successfully!");
  console.log("Your existing admin role and orders are unchanged.");
} catch (error) {
  console.error("Password reset failed:", error.message);
} finally {
  rl.close();
  await mongoose.disconnect().catch(() => {});
}
