const { chromium } = require("@playwright/test");
const { spawn } = require("child_process");

async function run() {
  console.log("Starting Vite dev server...");
  const server = spawn("npm", ["run", "dev"], { stdio: "pipe" });

  server.stdout.on("data", (data) => {
    console.log(`[Server STDOUT]: ${data}`);
  });

  server.stderr.on("data", (data) => {
    console.error(`[Server STDERR]: ${data}`);
  });

  // Give Vite some time to start up
  await new Promise((resolve) => setTimeout(resolve, 3000));

  console.log("Launching browser...");
  const browser = await chromium.launch();
  const page = await browser.newPage();

  page.on("console", (msg) => {
    console.log(`[Browser Console] ${msg.type()}: ${msg.text()}`);
  });

  page.on("pageerror", (err) => {
    console.error(`[Browser PageError]: ${err.message}\nStack:\n${err.stack}`);
  });

  try {
    console.log("Navigating to http://localhost:5175 ...");
    await page.goto("http://localhost:5175", { waitUntil: "networkidle" });
    console.log("Navigation completed.");
  } catch (err) {
    console.error("Failed to navigate:", err);
  } finally {
    console.log("Closing browser...");
    await browser.close();
    console.log("Stopping server...");
    server.kill();
  }
}

run().catch(console.error);
