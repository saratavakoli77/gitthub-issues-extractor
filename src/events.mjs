import fs from 'fs';

const FILE_PATH = './events.json';

function initializeEventsFile() {
  fs.writeFileSync(FILE_PATH, JSON.stringify([]));
}

export function saveEventsToFile(events, issueId) {
  if (!fs.existsSync(FILE_PATH)) {
    initializeEventsFile();
  }

  const prevEvents = JSON.parse(fs.readFileSync(FILE_PATH));
  fs.writeFileSync(
    FILE_PATH,
    JSON.stringify(
      [...prevEvents, ...events.map((e) => ({ issueId, ...e }))],
      null,
      2
    )
  );
}
