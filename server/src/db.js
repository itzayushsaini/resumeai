import mongoose from "mongoose";

export async function connectDatabase(uri) {
  mongoose.set("strictQuery", true);
  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 10_000 });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("\n  Could not connect to MongoDB.");
    if (/whitelist|ip|ENOTFOUND|timed out|Server selection/i.test(message)) {
      console.error("  Check that your IP is allowed in Atlas → Network Access, and the URI is correct.");
    }
    if (/auth/i.test(message)) {
      console.error("  Check the database username and password in MONGODB_URI.");
    }
    console.error(`  (${message})\n`);
    process.exit(1);
  }

  const db = mongoose.connection.db;
  if (!db) throw new Error("MongoDB connected but no database handle is available");
  return db;
}

export async function disconnectDatabase() {
  await mongoose.disconnect();
}
