module.exports = {
  branches: ["main"],
  repositoryUrl: "https://github.com/Mechack08/prisma-smart-query",
  plugins: [
    "@semantic-release/commit-analyzer", // determines release type from commits
    "@semantic-release/release-notes-generator", // generates release notes
    [
      "@semantic-release/changelog",
      {
        changelogFile: "CHANGELOG.md",
      },
    ],
    "@semantic-release/npm", // publishes to npm
    [
      "@semantic-release/git",
      {
        assets: ["CHANGELOG.md", "package.json"],
        message:
          "chore(release): ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}",
      },
    ],
    "@semantic-release/github",
  ],
};
