import { existsSync } from "node:fs";
import path from "node:path";
import puppeteer, { type Browser } from "puppeteer-core";
import type { ResumeDTO } from "@resumeai/shared";
import { env } from "../env";
import { HttpError } from "./http-error";

function candidateBrowserPaths(): string[] {
  const local = process.env.LOCALAPPDATA ?? "";
  switch (process.platform) {
    case "win32":
      return [
        "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
        "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
        path.join(local, "Google\\Chrome\\Application\\chrome.exe"),
        "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
        "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
      ];
    case "darwin":
      return [
        "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
        "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
        "/Applications/Chromium.app/Contents/MacOS/Chromium",
      ];
    default:
      return ["/usr/bin/google-chrome", "/usr/bin/chromium", "/usr/bin/chromium-browser"];
  }
}

function findBrowser(): string {
  const found = [env.CHROME_PATH, ...candidateBrowserPaths()].find((p): p is string => !!p && existsSync(p));
  if (!found) {
    throw new HttpError(503, "PDF export needs Chrome, Edge or Chromium. Set CHROME_PATH in server/.env.");
  }
  return found;
}

let browserPromise: Promise<Browser> | null = null;

function getBrowser(): Promise<Browser> {
  if (!browserPromise) {
    browserPromise = puppeteer
      .launch({
        executablePath: findBrowser(),
        headless: true,
        args: ["--disable-gpu", "--no-first-run", "--no-default-browser-check"],
      })
      .then((browser) => {
        browser.on("disconnected", () => {
          browserPromise = null;
        });
        return browser;
      })
      .catch((error) => {
        browserPromise = null;
        throw error;
      });
  }
  return browserPromise;
}

/** Loads the client's print page and saves it as a PDF with a real text layer. */
export async function renderPdf(url: string): Promise<Uint8Array> {
  const browser = await getBrowser();
  const page = await browser.newPage();
  try {
    await page.goto(url, { waitUntil: "load", timeout: 30_000 });
    // The print page sets this once data, fonts and pagination are done.
    await page.waitForFunction("window.__RESUME_READY__ === true", { timeout: 20_000 });
    const failed = await page.evaluate("window.__RESUME_ERROR__ ?? null");
    if (failed) throw new HttpError(500, `Could not render the resume: ${String(failed)}`);
    return await page.pdf({ preferCSSPageSize: true, printBackground: true });
  } finally {
    await page.close().catch(() => {});
  }
}

export async function closeBrowser() {
  if (!browserPromise) return;
  const browser = await browserPromise.catch(() => null);
  await browser?.close().catch(() => {});
  browserPromise = null;
}

export function pdfFilename(resume: ResumeDTO): string {
  const base = (resume.content.basics.name || resume.title || "Resume")
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "_");
  return `${base || "Resume"}_Resume.pdf`;
}
