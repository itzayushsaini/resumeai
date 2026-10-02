import { env } from "./env.js";
import { connectDatabase, disconnectDatabase } from "./db.js";
import { createAuth, setAuth } from "./auth.js";
import { createApp } from "./app.js";
import { closeBrowser } from "./lib/pdf.js";

const db = await connectDatabase(env.MONGODB_URI);
const auth = createAuth(db);
setAuth(auth);

const app = createApp(auth);
const server = app.listen(env.PORT, () => {
  console.log(`  API ready on http://localhost:${env.PORT}`);
});

async function shutdown(signal) {
  console.log(`\n  ${signal} received, shutting down…`);
  server.close();
  await Promise.allSettled([closeBrowser(), disconnectDatabase()]);
  process.exit(0);
}

process.on("SIGINT", () => void shutdown("SIGINT"));
process.on("SIGTERM", () => void shutdown("SIGTERM"));
