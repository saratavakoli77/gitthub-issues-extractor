import fetch from 'node-fetch';

const API_BASE_URL = 'https://api.github.com';

export function fetchRepositoryIssues({
  page = 1,
  perPage = 100,
  owner,
  repository,
}) {
  return fetch(
    `${API_BASE_URL}/repos/${owner}/${repository}/issues?state=all&page=${page}&per_page=${perPage}&`,
    {
      headers: {
        Accept: 'application/vnd.github+json',
        Authorization: `Bearer ${process.env.GITHUB_API_KEY}`,
        'X-GitHub-Api-Version': '2022-11-28',
      },
    }
  ).then((res) => res.json());
}

export function fetchIssueComments({
  page = 1,
  perPage = 100,
  owner,
  repository,
  issueId,
}) {
  return fetch(
    `${API_BASE_URL}/repos/${owner}/${repository}/issues/${issueId}/comments?page=${page}&per_page=${perPage}`,
    {
      headers: {
        Accept: 'application/vnd.github+json',
        Authorization: 'Bearer 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',
        'X-GitHub-Api-Version': '2022-11-28',
      },
    }
  ).then((res) => res.json());
}

export function fetchIssueEvents({
  page = 1,
  perPage = 100,
  owner,
  repository,
  issueId,
}) {
  return fetch(
    `${API_BASE_URL}/repos/${owner}/${repository}/issues/${issueId}/timeline?page=${page}&per_page=${perPage}`,
    {
      headers: {
        Accept: 'application/vnd.github+json',
        Authorization: `Bearer ${process.env.GITHUB_API_KEY}`,
        'X-GitHub-Api-Version': '2022-11-28',
      },
    }
  ).then((res) => res.json());
}
