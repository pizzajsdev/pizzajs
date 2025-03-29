module.exports = {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "header-max-length": [1, "always", 160],
    "body-max-line-length": [1, "always", 160],
  },
  ignores: [
    (commit) => commit.includes("chore: upgrade deps"),
  ],
};
