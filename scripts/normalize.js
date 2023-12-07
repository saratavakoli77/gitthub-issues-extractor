import { parse } from "csv-parse/sync";
import { stringify } from "csv-stringify/sync";
import fs from "fs";

let rows = parse(fs.readFileSync("./comments-1.csv"));

rows = rows.map((issue) => {
  const body = issue[5];
  let links = "";

  let matches = body.match(/#\d+/g);
  if (matches) {
    links = matches.map((m) => m.replace("#", "")).join(",");
  }

  matches = body.match(/\/issues\/\d+/g);
  if (matches) {
    links = matches
      .map((m) => m.replace("#", ""))
      .map((m) => m.replace(/\D/g, ""))
      .join(",");
  }

  if (links !== issue[6]) {
    console.log("new-links-found");
    return [...issue.slice(0, 6), links];
  } else {
    return issue;
  }
});

fs.writeFileSync("./comments-1-normalized.csv", stringify(rows));
