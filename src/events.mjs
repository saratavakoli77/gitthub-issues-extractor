import fs from "fs";

const FILE_PATH = "./events.json";

function initializeEventsFile() {
  fs.writeFileSync(
    FILE_PATH,
    JSON.stringify([])
  );
}

export function saveEventsToFile(events) {
  if (!fs.existsSync(FILE_PATH)) {
    initializeEventsFile();
  }

  const prevEvents = fs.readFileSync(FILE_PATH);

  fs.writeFileSync(
    FILE_PATH,
    JSON.stringify([...JSON.parse(prevEvents), ...events])
  );
}