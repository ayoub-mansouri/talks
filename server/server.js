const { createServer } = require("http");
const Router = require("./router");
const statik = require("node-static");
const { randomUUID } = require("crypto");
const { writeFile } = require("fs").promises;

const router = new Router();
const defaultHeaders = {
  "Content-Type": "text/plain",
  "Access-Control-Allow-Origin": "http://localhost:3000",
  "Access-Control-Allow-Methods": "GET, PUT, POST, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, If-None-Match, Prefer",
  "Access-Control-Expose-Headers": "ETag",
  "Access-Control-Allow-Credentials": "true",
};

const talkPath = /^\/talks\/([^/]+)$/;

router.add("OPTIONS", /.*/, async () => {
  return {};
});

router.add("GET", /^\/join\/?$/, async () => {
  return {
    headers: {
      "Set-Cookie": `userid=${randomUUID()}; Expires=${new Date(
        2222,
        1,
        1
      ).toUTCString()}`,
    },
  };
});

router.add("GET", /^\/talks\/?$/, async (server, request) => {
  let tag = /"(.*)"/.exec(request.headers["if-none-match"]);
  let wait = /wait=(\d+)/.exec(request.headers["prefer"]);

  if (!tag || tag[1] != server.version) {
    return server.talkResponse();
  } else if (!wait) {
    return { status: 304 };
  } else return server.waitForChanges(Number(wait[1]));
});

router.add("GET", talkPath, async (server, title) => {
  if (title in server.talks) {
    return {
      body: JSON.stringify(server.talks[title]),
      headers: { "Content-Type": "applicaton/json" },
    };
  } else return { status: 404, body: `No Talk ${title} Found` };
});

router.add("DELETE", talkPath, async (server, title) => {
  if (title in server.talks) {
    delete server.talks[title];
    await server.updated();
  }
  return { status: 204 };
});

function readStream(stream) {
  return new Promise((resolve, reject) => {
    let collectedData = "";
    stream.on("error", reject);
    stream.on("data", (data) => (collectedData += data.toString()));
    stream.on("end", () => resolve(collectedData));
  });
}

router.add("PUT", talkPath, async (server, title, request) => {
  let bodyContent = await readStream(request);
  let talk;
  try {
    talk = JSON.parse(bodyContent);
  } catch (_) {
    return { status: 400, body: "Invalid JSON" };
  }

  if (
    talk &&
    typeof talk.presenter == "string" &&
    typeof talk.summary == "string"
  ) {
    server.talks[title] = {
      userid: talk.userid,
      title,
      presenter: talk.presenter,
      summary: talk.summary,
      comments: [],
    };
    await server.updated();
  } else return { status: 400, body: "Bad Talk Data" };
  return { status: 204 };
});

router.add(
  "POST",
  /^\/talks\/([^\/]+)\/comments$/,
  async (server, title, request) => {
    let bodyContent = await readStream(request);
    let comment;
    try {
      comment = JSON.parse(bodyContent);
    } catch (_) {
      return { status: 400, body: "Invalid JSON" };
    }

    if (
      !comment ||
      typeof comment.author != "string" ||
      typeof comment.message != "string"
    ) {
      return { status: 400, body: "Bad Comment Data" };
    }

    if (title in server.talks) {
      server.talks[title].comments.push({
        userid: comment.userid,
        author: comment.author,
        message: comment.message,
      });
      await server.updated();
      return { status: 204 };
    } else return { status: 404, body: `No Talk ${title} Found` };
  }
);

const SkillShareServer = class {
  constructor(talks) {
    this.talks = talks;
    this.version = 0;
    this.waiting = [];

    const fileServer = new statik.Server("./public");

    this.server = createServer((request, response) => {
      let userid = /id=([^;]+)/.exec(request.headers.cookie);
      if (
        !request.url.match(/^\/join\/?$/) &&
        request.method !== "OPTIONS" &&
        (!userid || !userid[1])
      ) {
        response.writeHead(403, {
          ...defaultHeaders,
        });
        response.end();
      }
      let resolved = router.resolve(this, request);
      if (resolved != null) {
        resolved
          .catch((error) => {
            if (error.status) return error;
            return { status: 500, body: String(error) };
          })
          .then((result) => {
            let { status = 200, headers, body } = result;
            response.writeHead(status, {
              ...defaultHeaders,
              ...headers,
            });
            response.end(body);
          });
      } else {
        fileServer.serve(request, response);
      }
    });
  }

  start(port) {
    this.server.listen(port, () => {
      console.log(`Listening on port ${port} ...`);
    });
  }

  stop() {
    this.server.close();
  }
};

SkillShareServer.prototype.talkResponse = function () {
  let talks = [];
  for (let title of Object.keys(this.talks)) {
    talks.push(this.talks[title]);
  }
  return {
    body: JSON.stringify(talks),
    headers: {
      ...defaultHeaders,
      ETag: this.version,
      "Content-Type": "application/json",
    },
  };
};

SkillShareServer.prototype.waitForChanges = function (time) {
  return new Promise((resolve, reject) => {
    this.waiting.push(resolve);
    setTimeout(() => {
      if (!this.waiting.includes(resolve)) return;
      this.waiting = this.waiting.filter((r) => r != resolve);
      resolve({ status: 304 });
    }, time * 1000);
  });
};

SkillShareServer.prototype.updated = async function () {
  await writeFile("./talks.json", JSON.stringify(this.talks), { flag: "w" });
  this.version++;
  let response = this.talkResponse();
  this.waiting.forEach((resolve) => resolve(response));
  this.waiting = [];
};

module.exports = SkillShareServer;
