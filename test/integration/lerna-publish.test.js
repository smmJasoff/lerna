import execa from "execa";
import fs from "fs-promise";
import globby from "globby";
import normalizeNewline from "normalize-newline";
import initFixture from "../helpers/initFixture";
import loadPkgManifests from "../helpers/loadPkgManifests";
import { LERNA_BIN } from "../helpers/constants";

const lastCommitMessage = (cwd) =>
  execa.stdout("git", ["log", "-1", "--format=%B"], { cwd }).then(normalizeNewline);

describe("lerna publish", () => {
  test.concurrent("updates fixed versions", async () => {
    const cwd = await initFixture("PublishCommand/normal");
    const args = [
      "publish",
      "--skip-npm",
      "--cd-version=patch",
      "--yes",
    ];

    const stdout = await execa.stdout(LERNA_BIN, args, { cwd });
    expect(stdout).toMatchSnapshot("stdout: updates fixed versions");

    const [allPackageJsons, commitMessage] = await Promise.all([
      loadPkgManifests(cwd),
      lastCommitMessage(cwd),
    ]);

    expect(allPackageJsons).toMatchSnapshot("packages: updates fixed versions");
    expect(commitMessage).toMatchSnapshot("commit: updates fixed versions");
  });

  test.concurrent("updates independent versions", async () => {
    const cwd = await initFixture("PublishCommand/independent");
    const args = [
      "publish",
      "--skip-npm",
      "--cd-version=major",
      "--yes",
    ];

    const stdout = await execa.stdout(LERNA_BIN, args, { cwd });
    expect(stdout).toMatchSnapshot("stdout: updates independent versions");

    const [allPackageJsons, commitMessage] = await Promise.all([
      loadPkgManifests(cwd),
      lastCommitMessage(cwd),
    ]);

    expect(allPackageJsons).toMatchSnapshot("packages: updates independent versions");
    expect(commitMessage).toMatchSnapshot("commit: updates independent versions");
  });

  // TODO: stabilize timestamp of changelog output
  // TODO: make interesting git history for meaningful snapshots
  test.skip("--conventional-commits", async () => {
    const cwd = await initFixture("PublishCommand/independent");
    const args = [
      "publish",
      "--conventional-commits",
      "--skip-git",
      "--skip-npm",
      "--yes",
    ];

    const stdout = await execa.stdout(LERNA_BIN, args, { cwd });
    expect(stdout).toMatchSnapshot("stdout: --conventional-commits");

    const [allPackageJsons, changelogFiles] = await Promise.all([
      loadPkgManifests(cwd),
      globby(["CHANGELOG.md"], { cwd, absolute: true, matchBase: true })
        .then((changelogs) => Promise.all(
          changelogs.map((fp) => fs.readFile(fp, "utf8"))
        )),
    ]);

    expect(allPackageJsons).toMatchSnapshot("packages: --conventional-commits");
    expect(changelogFiles).toMatchSnapshot("changelog: --conventional-commits");
  });
});
