/**
 * Git integration module — uses git blame to track annotation age and authorship.
 */

import { execSync } from 'child_process';
import * as path from 'path';

/** Result from git blame for a specific line */
export interface BlameInfo {
  author: string;
  date: string;
  commitHash: string;
  ageDays: number;
}

/**
 * Check if a directory is a git repository.
 */
export function isGitRepo(directory: string): boolean {
  try {
    execSync('git rev-parse --git-dir', {
      cwd: directory,
      stdio: 'pipe',
      encoding: 'utf-8',
    });
    return true;
  } catch {
    return false;
  }
}

/**
 * Get git blame information for a specific line in a file.
 */
export function getBlameInfo(
  directory: string,
  filePath: string,
  line: number
): BlameInfo | null {
  try {
    const result = execSync(
      `git -c core.abbrev=40 blame -L ${line},${line} --porcelain "${filePath}"`,
      {
        cwd: directory,
        stdio: 'pipe',
        encoding: 'utf-8',
        timeout: 10000,
      }
    );

    const lines = result.split('\n');
    const header = lines[0]?.split(' ');
    const commitHash = header?.[0] || '';

    let author = '';
    let authorTime = '';

    for (const line of lines) {
      if (line.startsWith('author ')) {
        author = line.slice(7).trim();
      } else if (line.startsWith('author-time ')) {
        authorTime = line.slice(12).trim();
      }
    }

    if (!author || !authorTime) {
      return null;
    }

    const commitDate = new Date(parseInt(authorTime, 10) * 1000);
    const now = new Date();
    const ageDays = Math.floor((now.getTime() - commitDate.getTime()) / (1000 * 60 * 60 * 24));

    return {
      author,
      date: commitDate.toISOString(),
      commitHash,
      ageDays,
    };
  } catch {
    return null;
  }
}

/**
 * Get git log statistics for the repository (total commits, active contributors).
 */
export interface GitRepoStats {
  totalCommits: number;
  totalContributors: number;
  lastCommitDate: string | null;
  branches: number;
}

export function getGitRepoStats(directory: string): GitRepoStats | null {
  try {
    const totalCommits = parseInt(
      execSync('git rev-list --count HEAD 2>/dev/null || echo 0', {
        cwd: directory,
        stdio: 'pipe',
        encoding: 'utf-8',
        timeout: 5000,
      }).trim(),
      10
    );

    const contributors = execSync(
      `git shortlog -sn HEAD 2>/dev/null | wc -l || echo 0`,
      {
        cwd: directory,
        stdio: 'pipe',
        encoding: 'utf-8',
        timeout: 5000,
      }
    ).trim();

    const lastCommit = execSync(
      'git log -1 --format=%cI 2>/dev/null || echo ""',
      {
        cwd: directory,
        stdio: 'pipe',
        encoding: 'utf-8',
        timeout: 5000,
      }
    ).trim();

    const branches = parseInt(
      execSync('git branch --list 2>/dev/null | wc -l || echo 0', {
        cwd: directory,
        stdio: 'pipe',
        encoding: 'utf-8',
        timeout: 5000,
      }).trim(),
      10
    );

    return {
      totalCommits,
      totalContributors: parseInt(contributors, 10),
      lastCommitDate: lastCommit || null,
      branches,
    };
  } catch {
    return null;
  }
}