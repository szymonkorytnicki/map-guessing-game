import { countries } from "./countries.js";
import { formatName } from "./formatName.js";
import https from "https";
import fs from "fs";

function download(name) {
  const file = fs.createWriteStream(`${name}.svg`);
  https.get(`https://www.amcharts.com/lib/3/maps/svg/${name}Low.svg`, function (response) {
    // TODO add maps credentials!
    response.pipe(file);

    file.on("finish", () => {
      file.close();
      console.log("Download Completed for ", name);
    });
  });
}

countries.forEach((country) => {
  download(formatName(country.name));
});
