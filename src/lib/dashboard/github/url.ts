import { getPublicEnv } from "@/lib/dashboard/runtime/public-env";

export function getGithubUrl() {
  return getPublicEnv().githubUrl;
}

export function getGithubRepoPath(path = "") {
  const base = getGithubUrl().replace(/\/$/, "");
  if (!path) {
    return base;
  }

  return `${base}/${path.replace(/^\//, "")}`;
}
