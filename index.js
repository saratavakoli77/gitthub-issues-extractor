import yargs from 'yargs/yargs';
import { hideBin } from 'yargs/helpers';
import fs from 'fs';
import { parse } from 'csv-parse/sync';

import { fetchAndSaveIssues } from './src/issues.mjs';
import { saveEventsToFile } from './src/events.mjs';
import logger from './src/services/logger.mjs';
import { fetchIssueEvents } from './src/api.mjs';

const argv = yargs(hideBin(process.argv)).argv;

const API_DELAY_IN_MINUTES = 30;

async function fetchIssues() {
  let hasMoreIssues = true;
  let page = Number(process.env.ISSUES_START_PAGE) || 1;
  let delay = API_DELAY_IN_MINUTES;

  while (hasMoreIssues) {
    logger.info(`fetch issues page: ${page}`);
    try {
      hasMoreIssues = await fetchAndSaveIssues({ page });
      delay = API_DELAY_IN_MINUTES;
    } catch (error) {
      if (error && error.message === 'RATE LIMIT EXCEEDED') {
        logger.warn(
          `rate limit exceeded on page: ${page}, waiting ${API_DELAY_IN_MINUTES} minute`
        );

        await new Promise((resolve) =>
          setTimeout(resolve, API_DELAY_IN_MINUTES * 60 * 1_000)
        );
        delay *= 2;
      } else {
        logger.error(`Unknown error on page: ${page}, error: ${error}`);
        process.exit(1);
      }
    }

    page++;
  }

  logger.info(`fetched all issues. total page: ${page}`);
  process.exit(0);
}

async function fetchEvents() {
  if (!fs.existsSync('./issues.csv')) {
    console.error('issues.csv not found');
    process.exit(1);
  }

  let delay = API_DELAY_IN_MINUTES;
  const issueIDs = parse(fs.readFileSync('./issues.csv'))
    .slice(1)
    .map((issue) => issue[2]);

  const startingIndex = Number(process.env.EVENTS_START_INDEX) || 0;

  for (let index = startingIndex; index < issueIDs.length; index++) {
    try {
      const id = issueIDs[index];

      const data = await fetchIssueEvents({
        page: 1,
        perPage: 100,
        owner: process.env.GITHUB_REPO_OWNER,
        repository: process.env.GITHUB_REPO,
        issueId: id,
      });

      if (Array.isArray(data)) {
        const filteredEvents = data.filter(
          (event) => event.event === 'cross-referenced'
        );

        if (filteredEvents.length) {
          try {
            saveEventsToFile(filteredEvents, id);
            delay = API_DELAY_IN_MINUTES;

            logger.info(
              `fetched events of issue index: ${index}, issue-id: ${id}`
            );
          } catch (error) {
            logger.error(
              `error on saving events of issue index: ${index}, issue-id: ${id}, error: ${JSON.stringify(
                error
              )}`
            );
            process.exit(1);
          }
        } else {
          logger.info(
            `fetched events of issue index: ${index}, issue-id: ${id}`
          );
        }
      } else if (data && data.message === 'Bad credentials') {
        logger.warn(
          `rate limit exceeded on index: ${index}, issue-id: ${id}, waiting ${API_DELAY_IN_MINUTES} minute`
        );

        await new Promise((resolve) =>
          setTimeout(resolve, API_DELAY_IN_MINUTES * 60 * 1_000)
        );
        delay *= 2;
      } else if (data && data.message === 'Not Found') {
        logger.info(`No events found on index: ${index}, issue-id: ${id}`);
      } else {
        logger.error(`Unknown error on index: ${index}, issue-id: ${id}`);
      }
    } catch (error) {
      logger.error(`Unknown error on index: ${index}, error: ${error}`);
    }
  }

  logger.info(`fetched all events. total page: ${page}`);
  process.exit(0);
}

if (argv.action === 'fetch-issues') {
  fetchIssues();
} else if (argv.action === 'fetch-events') {
  fetchEvents();
} else {
  console.error('invalid action');
  process.exit(1);
}
