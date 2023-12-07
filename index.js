import yargs from 'yargs/yargs';
import { hideBin } from 'yargs/helpers';

import { fetchAndSaveIssues } from './src/issues.mjs';
import logger from './src/services/logger.mjs';

const argv = yargs(hideBin(process.argv)).argv;

const API_DELAY = 1_000 * 5;

async function fetchIssues() {
  let hasMoreIssues = true;
  let page = 1;
  let delay = API_DELAY;

  while (hasMoreIssues) {
    logger.info(`fetch issues page: ${page}`);
    try {
      hasMoreIssues = await fetchAndSaveIssues({ page });

      delay = API_DELAY;
    } catch (error) {
      logger.error(`error fetching issues page: ${page}`, error);
      await new Promise((resolve) => setTimeout(resolve, delay));
      delay *= 2;
    }

    page++;
  }
}

function fetchEvents() {}

if (argv.action === 'fetch-issues') {
  fetchIssues();
} else if (argv.action === 'fetch-events') {
  fetchEvents();
} else {
  console.error('invalid action');
  process.exit(1);
}
