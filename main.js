import { parse } from "csv-parse/sync";
import fs from "fs";
import {
  fetchRepositoryIssues,
  fetchIssueComments,
  fetchIssueEvents,
} from "./src/api.mjs";
import { saveIssuesToFile } from "./src/issues.mjs";
import { saveCommentsToFile } from "./src/comments.mjs";
import { saveEventsToFile } from "./src/events.mjs";

const OWNER = "microsoft";
const REPO = "vscode";

const issuesWithComments = [];

async function fetchAndSaveIssues(page) {
  const issues = await fetchRepositoryIssues({
    page,
    owner: OWNER,
    repository: REPO,
  });

  issues.forEach((issue) => {
    if (issue.comments) {
      issuesWithComments.push(issue.number);
    }
  });

  await saveIssuesToFile(issues);
  return issues.length > 0;
}

async function main() {
  let hasMoreIssues = true;
  let page = 1;
  let shouldSaveIssues = true;

  // if (fs.existsSync("./issues.csv")) {
  //   let issuesFromFile = parse(fs.readFileSync("./issues.csv"));
  //   issuesFromFile.forEach((issue) => {
  //     if (issue[6] && +issue[6] > 0) {
  //       issuesWithComments.push(issue[2]);
  //     }
  //   });

  //   issuesFromFile = null;
  //   shouldSaveIssues = false;
  // }

  while (hasMoreIssues && shouldSaveIssues) {
    console.log(`Fetch issues page: ${page}`);
    hasMoreIssues = await fetchAndSaveIssues(page);
    page++;
  }

  return;
  if (issuesWithComments.length) {
    console.log(
      `Start Fetching comments of ${issuesWithComments.length} issues`
    );
    for (let i = 4750; i < issuesWithComments.length; i++) {
      console.log(`issue #${i}`);
      try {
        const comments = await fetchIssueComments({
          page: 1,
          perPage: 100,
          owner: OWNER,
          repository: REPO,
          issueId: issuesWithComments[i],
        });

        saveCommentsToFile(issuesWithComments[i], comments);
      } catch {
        i--;
      }
    }
  }
}

function readIssues() {
  const issues = parse(fs.readFileSync("./issues.csv"));
  return issues.map((issue) => issue[2]);
}

(async function () {
  const issueIDs = readIssues();

  for (let index = 0; index < issueIDs.length; index++) {
    try {
      console.log(`fetch events of issue index: ${index}`);
      const data = await fetchIssueEvents({
        page: 1,
        perPage: 100,
        owner: OWNER,
        repository: REPO,
        issueId: issueIDs[index],
      });

      if (Array.isArray(data)) {
        const filteredEvents = data.filter(
          (event) => event.event === "cross-referenced"
        );
        
        console.log(`found ${filteredEvents.length} events out of ${data.length} events`)
        if (filteredEvents.length) {
          saveEventsToFile(filteredEvents);
        }
      }
    } catch (error) {
      console.log(error)
      console.log("script failed on index: ", index);
      break;
    }
  }
})();

// main();
