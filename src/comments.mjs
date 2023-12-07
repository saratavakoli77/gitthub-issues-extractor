import { stringify } from "csv-stringify/sync";
import fs from "fs";
import path from "path";

const FILE_PATH = "./comments.csv";

function initializeCommentsFile() {
  fs.writeFileSync(
    FILE_PATH,
    stringify([
      ["url", "id", "issue_id", "created_at", "update_at", "body", "links"],
    ])
  );
}

export function saveCommentsToFile(issueId, comments) {
  if (!fs.existsSync(FILE_PATH)) {
    initializeCommentsFile();
  }

  const rows = comments.map((comment) => {
    let links = " ";
    let matches = comment.body.match(/#\d+/g);
    if (matches) {
      links = matches.map((m) => m.replace("#", "")).join(",");
    }

    matches = comment.body.match(/\/issues\/\d+/g);
    if (matches) {
      links = matches
        .map((m) => m.replace("#", ""))
        .map((m) => m.replace(/\D/g, ""))
        .join(",");
    }

    return [
      comment.url,
      comment.id,
      issueId,
      comment.created_at,
      comment.updated_at,
      comment.body,
      links,
    ];
  });

  fs.appendFileSync(FILE_PATH, stringify(rows));
}
