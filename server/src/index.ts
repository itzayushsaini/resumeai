import { env } from "./env";
import { connectDatabase, disconnectDatabase } from "./db";
import { createAuth, setAuth } from "./auth";
import { createApp } from "./app";
import { closeBrowser } from "./lib/pdf";

const db = await connectDatabase(env.MONGODB_URI);
const auth = createAuth(db);
setAuth(auth);

const app = createApp(auth);
const server = app.listen(env.PORT, () => {
  console.log(`  API ready on http://localhost:${env.PORT}`);
});

async function shutdown(signal: string) {
  console.log(`\n  ${signal} received, shutting down…`);
  server.close();
  await Promise.allSettled([closeBrowser(), disconnectDatabase()]);
  process.exit(0);
}

process.on("SIGINT", () => void shutdown("SIGINT"));
process.on("SIGTERM", () => void shutdown("SIGTERM"));
