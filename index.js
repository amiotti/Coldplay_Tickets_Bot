const express = require("express");
const app = express();
const morgan = require("morgan");
const puppeteer = require("puppeteer");
const PORT = 3000;
const notifier = require("node-notifier");

app.use(morgan("dev"));
app.use(express.json());
const URL = "https://www.allaccess.com.ar/event/coldplay";

const main = async () => {
  try {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(URL);
    const queue = await page.$(".queue");

    if (queue) {
      console.log("COLA");
      await page.screenshot({ path: "onQueue.png" });
      await page.waitForSelector("#Event", {
        waitUntil: "load",
        visible: true,
        timeout: 1800000,
      });

      await page.screenshot({ path: "afterWait.png" });

      let estado = await page.$$eval(".dropdown-menu", (el) => {
        return Array.from(el[0].children).map((el) => el.className);
      });

      console.log(estado);
      if (estado.includes("available")) {
        notifier.notify({
          title: "ENTRADAS COLDPLAY",
          message: "Hay entradas disponibles",
        });
      } else {
        notifier.notify({
          title: "ENTRADAS COLDPLAY",
          message: "No hay entradas disponibles",
        });
      }
    }

    await browser.close();
  } catch (error) {
    console.log("ERROR: ", error.message);
  }
};
main();
setInterval(() => {
  main();
}, 1000 * 60 * 3);

app.listen(PORT, () => {
  console.log(`Server running on PORT: ${PORT}`);
});
