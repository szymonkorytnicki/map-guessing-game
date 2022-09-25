import puppeteer from "puppeteer";
import { countriesData } from "./countries.js";
import { formatName } from "./formatName.js";
const urlArray = countriesData.map((data) => {
  return formatName(data.name);
});

(async () => {
  // Create a browser instance
  const browser = await puppeteer.launch();

  // Create a new page
  const page = await browser.newPage();
  await page.setViewport({ width: 1500, height: 1500 });
  for (var i = 0; i < urlArray.length; i++) {
    const name = urlArray[i];

    // Open URL in current page
    await page.goto(`http://localhost:5173/src/assets/maps/${name}.svg`, { waitUntil: "networkidle0" });

    // Capture screenshot
    await page.screenshot({
      path: `svgToPng/${name}.jpg`,
      fullPage: true,
    });
  }

  // Close the browser instance
  await browser.close();
})();

// https://github.com/remove-bg/remove-bg-cli
// removebg images/*.{png,jpg}
