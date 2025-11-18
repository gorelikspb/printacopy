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
  const baseFileUrl = `file://${path.join(projectRoot, 'index.html').replace(/\\/g, '/')}`;
  const screenshotsDir = path.join(projectRoot, 'printacopy_log', 'screenshots');

  const languages = ['ru', 'en'];
  const sections = [
    { name: 'Hero', selector: '.hero', file: '01-hero-header.png' },
    { name: 'User section', selector: '#print-section', file: '02-user-section.png' },
    { name: 'Printer section', selector: '#printer-section', file: '03-printer-section.png' },
    { name: 'How it works', selector: '.how-it-works', file: '04-how-it-works.png' },
  ];

  const browser = await puppeteer.launch({
    headless: 'new',
    defaultViewport: { width: 1440, height: 900, deviceScaleFactor: 2 },
  });

  try {
    for (const lang of languages) {
      console.log(`\n🌐 Генерируем скриншоты для языка: ${lang.toUpperCase()}`);
      const langDir = path.join(screenshotsDir, lang);
      await ensureDir(langDir);

      const page = await browser.newPage();
      const langUrl = `${baseFileUrl}?lang=${lang}`;
      await page.goto(langUrl, { waitUntil: 'networkidle0' });
      
      // Небольшая задержка для применения переводов
      await new Promise(resolve => setTimeout(resolve, 500));

      // Десктопные скриншоты
      for (const section of sections) {
        const outputPath = path.join(langDir, section.file);
        console.log(`  📸 "${section.name}" -> ${lang}/${section.file}`);
        await captureElement(page, section.selector, outputPath);
      }

      // Мобильная версия
      console.log(`  📱 Мобильная версия...`);
      await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true });
      await page.reload({ waitUntil: 'networkidle0' });
      await new Promise(resolve => setTimeout(resolve, 500));
      const mobilePath = path.join(langDir, '05-mobile-view.png');
      await page.screenshot({ path: mobilePath, fullPage: true });
      console.log(`  ✅ Сохранён: ${lang}/05-mobile-view.png`);
      
      await page.close();
    }

    console.log('\n✅ Все скриншоты успешно созданы!');
  } catch (error) {
    console.error('❌ Ошибка при создании скриншотов:', error);
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
}

main();


