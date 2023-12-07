import { stringify } from 'csv-stringify/sync';
import fs from 'fs';
import path from 'path';
import { fetchRepositoryIssues } from './api.mjs';
import logger from './services/logger.mjs';
import dotEnv from 'dotenv';

dotEnv.config();

const FILE_PATH = './issues.csv';

function initializeIssuesFile() {
  fs.writeFileSync(
    FILE_PATH,
    stringify([
      [
        'url',
        'id',
        'number',
        'title',
        'state',
        'locked',
        'comments',
        'created_at',
        'updated_at',
      ],
    ])
  );
}

function saveIssuesToFile(issues) {
  if (!fs.existsSync(FILE_PATH)) {
    initializeIssuesFile();
  }

  const rows = issues.map((issue) => [
    issue.url,
    issue.id,
    issue.number,
    issue.title,
    issue.state,
    issue.locked,
    issue.comments,
    issue.create_at,
    issue.updated_at,
  ]);

  fs.appendFileSync(FILE_PATH, stringify(rows));
}

export async function fetchAndSaveIssues({ page }) {
  const issues = await fetchRepositoryIssues({
    page,
    owner: process.env.GITHUB_REPO_OWNER,
    repository: process.env.GITHUB_REPO,
  });

  try {
    await saveIssuesToFile(issues);
  } catch (error) {
    logger.error(`error saving issues to file for page: ${page}`, error);
  }

  return issues.length > 0;
}
