const SkillShareServer = require("./server");
const { readFile } = require("fs").promises;

(async () => {
  let talks;
  try {
    talks = JSON.parse(await readFile("./talks.json", "utf-8"));
  } catch (e) {
    if (e.code != "ENOENT") throw e;
  }
  new SkillShareServer(talks || {}).start(5555);
})();
