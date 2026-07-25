const { chromium } = require('@playwright/test');
const { spawn } = require('child_process');

async function run() {
  console.log('Starting Vite dev server...');
  const server = spawn('npm', ['run', 'dev'], { stdio: 'pipe' });

  // Give Vite some time to start up
  await new Promise((resolve) => setTimeout(resolve, 3000));

  console.log('Launching browser...');
  const browser = await chromium.launch();
  const context = await browser.newContext({ userAgent: 'Playwright' });
  const page = await context.newPage();

  page.on('console', (msg) => {
    console.log(`[Browser Console] ${msg.type()}: ${msg.text()}`);
  });

  page.on('pageerror', (err) => {
    console.error(`[Browser PageError]: ${err.message}\nStack:\n${err.stack}`);
  });

  try {
    console.log('Navigating to http://localhost:5175 ...');
    await page.goto('http://localhost:5175', { waitUntil: 'networkidle' });
    
    const content = await page.content();
    console.log('HTML content length:', content.length);
    
    const isHeroTextVisible = await page.locator('.hero-title-text').first().isVisible();
    console.log('Is .hero-title-text visible?', isHeroTextVisible);
    
    const hasErrorText = await page.locator('text=Something went wrong').isVisible();
    console.log('Has "Something went wrong" text?', hasErrorText);
  } catch (err) {
    console.error('Failed to navigate:', err);
  } finally {
    console.log('Closing browser...');
    await browser.close();
    console.log('Stopping server...');
    server.kill();
  }
}

run().catch(console.error);
