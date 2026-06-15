import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import readline from "readline";

// Get current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename); // Fixed: using __filename

// Load env from parent directory
dotenv.config({ path: join(__dirname, "..", ".env") });

// Import models from parent directory
import Trade from "../models/Trade.js";
import FundingAccount from "../models/FundingAccount.js";
import User from "../models/User.js";

const clearData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    console.log("\n⚠️  WARNING: This will delete ALL data from your database!");
    console.log("This includes:");
    console.log("   - All trades");
    console.log("   - All funding accounts");
    console.log("   - All users (if you choose to)\n");

    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    rl.question(
      "Do you want to delete ALL data? (yes/no): ",
      async (answer) => {
        if (answer.toLowerCase() !== "yes") {
          console.log("❌ Operation cancelled.");
          rl.close();
          process.exit(0);
          return;
        }

        rl.question("Delete users as well? (yes/no): ", async (deleteUsers) => {
          const tradesCount = await Trade.countDocuments();
          const fundingCount = await FundingAccount.countDocuments();
          const usersCount = await User.countDocuments();

          console.log("\n📊 Current data count:");
          console.log(`   - Trades: ${tradesCount}`);
          console.log(`   - Funding Accounts: ${fundingCount}`);
          console.log(`   - Users: ${usersCount}`);

          console.log("\n🗑️  Deleting data...");

          // Delete trades
          const tradesDeleted = await Trade.deleteMany({});
          console.log(`   ✅ Deleted ${tradesDeleted.deletedCount} trades`);

          // Delete funding accounts
          const fundingDeleted = await FundingAccount.deleteMany({});
          console.log(
            `   ✅ Deleted ${fundingDeleted.deletedCount} funding accounts`,
          );

          // Delete users if requested
          if (deleteUsers.toLowerCase() === "yes") {
            const usersDeleted = await User.deleteMany({});
            console.log(`   ✅ Deleted ${usersDeleted.deletedCount} users`);
          } else {
            console.log(
              `   ⏭️  Skipped deleting users (${usersCount} users remain)`,
            );
          }

          console.log("\n✨ Database cleaned successfully!");
          rl.close();
          process.exit(0);
        });
      },
    );
  } catch (error) {
    console.error("Error clearing data:", error);
    process.exit(1);
  }
};

clearData();
