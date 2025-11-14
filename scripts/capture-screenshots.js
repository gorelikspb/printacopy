const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

async function ensureDir(dirPath) {
  await fs.promises.mkdir(dirPath, { recursive: true });
}

async function captureElement(page, selector, outputPath) {
  await page.waitForSelector(selector, { visible: true });
  const element = await page.$(selector);
  if (!element) {
    throw new Error(`Не найден элемент по селектору ${selector}`);
  }
  await element.screenshot({ path: outputPath });
  console.log(`✅ Сохранён скриншот: ${outputPath}`);
}

async function main() {
  const projectRoot = path.resolve(__dirname, '..');
  const fileUrl = `file://${path.join(projectRoot, 'index.html').replace(/\\/g, '/')}`;
  const screenshotsDir = path.join(projectRoot, 'screenshots');

  await ensureDir(screenshotsDir);

  const browser = await puppeteer.launch({
    headless: 'new',
    defaultViewport: { width: 1440, height: 900, deviceScaleFactor: 2 },
  });

  try {
    const page = await browser.newPage();
    await page.goto(fileUrl, { waitUntil: 'networkidle0' });

    const sections = [
      { name: 'Hero', selector: '.hero', file: '01-hero-header.png' },
      { name: 'User section', selector: '#print-section', file: '02-user-section.png' },
      { name: 'Printer section', selector: '#printer-section', file: '03-printer-section.png' },
      { name: 'How it works', selector: '.how-it-works', file: '04-how-it-works.png' },
    ];

    for (const section of sections) {
      const outputPath = path.join(screenshotsDir, section.file);
      console.log(`📸 Сохраняем "${section.name}" -> ${section.file}`);
      await captureElement(page, section.selector, outputPath);
    }

    console.log('📱 Сохраняем мобильную версию...');
    await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true });
    await page.reload({ waitUntil: 'networkidle0' });
    const mobilePath = path.join(screenshotsDir, '05-mobile-view.png');
    await page.screenshot({ path: mobilePath, fullPage: true });
    console.log(`✅ Сохранён скриншот: ${mobilePath}`);
  } catch (error) {
    console.error('❌ Ошибка при создании скриншотов:', error);
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
}

main();


