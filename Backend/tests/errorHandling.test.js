import { test, describe, before, after, mock } from "node:test";
import assert from "node:assert/strict";
import mongoose from "mongoose";

process.env.LOG_LEVEL = "silent"; // keep test output clean
process.env.JWT_SECRET_KEY = "test-secret";
delete process.env.REDIS_URL;

const { default: app } = await import("../app.js");
const { errorHandler, notFound, requestContext } = await import("../src/middlewares/errorHandler.js");
const { authorizeRoles } = await import("../src/middlewares/authMiddleware.js");
const { default: AppError } = await import("../src/utils/AppError.js");
const { default: logger } = await import("../src/utils/logger.js");

let server;
let base;
let connectStub;

before(async () => {
  // No real database in tests: pretend the connection succeeds.
  connectStub = mock.method(mongoose, "connect", async () => mongoose);
  await new Promise((resolve) => { server = app.listen(0, resolve); });
  base = `http://127.0.0.1:${server.address().port}`;
});

after(() => {
  mock.restoreAll();
  server.close();
});

const json = (res) => res.json();
const post = (path, { origin, body = "{}", headers = {} } = {}) =>
  fetch(base + path, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(origin ? { Origin: origin } : {}), ...headers },
    body,
  });

// ---- fake req/res for unit tests of the handler itself ----
const fakeRes = ({ headersSent = false } = {}) => {
  const res = { headersSent, statusCode: null, body: null };
  res.status = (c) => { res.statusCode = c; return res; };
  res.json = (b) => { res.body = b; return res; };
  return res;
};
const fakeReq = { id: "req-1", method: "GET", path: "/api/x" };

describe("CORS blocked origins", () => {
  test("blocked origin gets 403 JSON (not 500)", async () => {
    const res = await post("/api/auth/login", { origin: "https://evil.com" });
    assert.equal(res.status, 403);
    assert.match(res.headers.get("content-type"), /application\/json/);
    const body = await json(res);
    assert.equal(body.code, "CORS_ORIGIN_NOT_ALLOWED");
    assert.equal(body.message, "Origin not allowed");
    assert.ok(body.requestId);
  });

  test("blocked origin on preflight (OPTIONS) gets 403", async () => {
    const res = await fetch(base + "/api/auth/login", {
      method: "OPTIONS",
      headers: { Origin: "https://evil.com", "Access-Control-Request-Method": "POST" },
    });
    assert.equal(res.status, 403);
  });

  test("allowed origin still works (login validation still returns 400)", async () => {
    const res = await post("/api/auth/login", { origin: "https://seyat-kahani-portal.vercel.app" });
    assert.equal(res.status, 400);
    assert.equal((await json(res)).message, "Invalid input");
  });

  test("request with no Origin (Postman/server-to-server) still works", async () => {
    const res = await post("/api/auth/login");
    assert.equal(res.status, 400);
  });
});

describe("global error handling", () => {
  test("malformed JSON body -> 400 INVALID_JSON, not 500", async () => {
    const res = await post("/api/auth/login", { body: "{not json" });
    assert.equal(res.status, 400);
    assert.equal((await json(res)).code, "INVALID_JSON");
  });

  test("oversized body -> 413", async () => {
    const res = await post("/api/auth/login", { body: JSON.stringify({ a: "x".repeat(200 * 1024) }) });
    assert.equal(res.status, 413);
  });

  test("unknown /api route -> JSON 404", async () => {
    const res = await fetch(base + "/api/does-not-exist");
    assert.equal(res.status, 404);
    assert.equal((await json(res)).code, "NOT_FOUND");
  });

  test("database connection failure -> safe 500, internals not leaked", async () => {
    connectStub.mock.mockImplementationOnce(async () => {
      throw new Error("connect ECONNREFUSED mongodb+srv://user:SECRETPASS@cluster");
    });
    const res = await fetch(base + "/api/doctors");
    const text = await res.text();
    assert.equal(res.status, 500);
    assert.ok(!text.includes("SECRETPASS"));
    assert.ok(!text.includes("ECONNREFUSED"));
    assert.equal(JSON.parse(text).message, "Server Error");
  });

  test("every response carries a matching X-Request-Id", async () => {
    const res = await post("/api/auth/login", { origin: "https://evil.com" });
    assert.equal(res.headers.get("x-request-id"), (await json(res)).requestId);
  });
});

describe("errorHandler unit behaviour", () => {
  test("AppError keeps its status, message and code", () => {
    const res = fakeRes();
    errorHandler(new AppError("Nope", 418, "TEAPOT"), fakeReq, res, () => {});
    assert.equal(res.statusCode, 418);
    assert.deepEqual(res.body, { message: "Nope", code: "TEAPOT", requestId: "req-1" });
  });

  test("unexpected error -> generic 500 with no internal message", () => {
    const res = fakeRes();
    errorHandler(new Error("secret internal detail"), fakeReq, res, () => {});
    assert.equal(res.statusCode, 500);
    assert.equal(res.body.message, "Server Error");
    assert.ok(!JSON.stringify(res.body).includes("secret"));
  });

  test("unexpected errors always carry the generic INTERNAL_ERROR code", () => {
    const res = fakeRes();
    errorHandler(new Error("x"), fakeReq, res, () => {});
    assert.equal(res.body.code, "INTERNAL_ERROR");
  });

  test("mongoose ValidationError / CastError -> 400", () => {
    for (const name of ["ValidationError", "CastError"]) {
      const err = new Error("bad"); err.name = name;
      const res = fakeRes();
      errorHandler(err, fakeReq, res, () => {});
      assert.equal(res.statusCode, 400);
    }
  });

  test("duplicate key (11000) -> 409", () => {
    const res = fakeRes();
    errorHandler(Object.assign(new Error("dup"), { code: 11000 }), fakeReq, res, () => {});
    assert.equal(res.statusCode, 409);
  });

  test("JWT errors -> 401", () => {
    for (const name of ["JsonWebTokenError", "TokenExpiredError"]) {
      const err = new Error("jwt"); err.name = name;
      const res = fakeRes();
      errorHandler(err, fakeReq, res, () => {});
      assert.equal(res.statusCode, 401);
    }
  });

  test("if headers were already sent, delegates to Express instead of writing", () => {
    const res = fakeRes({ headersSent: true });
    let forwarded;
    const err = new Error("late");
    errorHandler(err, fakeReq, res, (e) => { forwarded = e; });
    assert.equal(forwarded, err);
    assert.equal(res.statusCode, null);
  });

  test("notFound forwards a 404 AppError; requestContext sets id + header", () => {
    let err;
    notFound({}, {}, (e) => { err = e; });
    assert.equal(err.statusCode, 404);

    const headers = {};
    const req = {};
    requestContext(req, { setHeader: (k, v) => { headers[k] = v; } }, () => {});
    assert.ok(req.id);
    assert.equal(headers["X-Request-Id"], req.id);
  });
});

describe("structured logging", () => {
  test("logs one JSON line with requestId/status and never the query string or body", () => {
    process.env.LOG_LEVEL = "info";
    const spy = mock.method(console, "warn", () => {});
    errorHandler(
      new AppError("Origin not allowed", 403, "CORS_ORIGIN_NOT_ALLOWED"),
      { id: "abc", method: "POST", path: "/api/auth/login", query: { token: "SECRET" }, body: { password: "SECRET" } },
      fakeRes(), () => {}
    );
    process.env.LOG_LEVEL = "silent";
    assert.equal(spy.mock.callCount(), 1);
    const line = spy.mock.calls[0].arguments[0];
    const parsed = JSON.parse(line);
    assert.equal(parsed.requestId, "abc");
    assert.equal(parsed.status, 403);
    assert.equal(parsed.level, "warn");
    assert.ok(!line.includes("SECRET"));
    spy.mock.restore();
  });

  test("logger respects LOG_LEVEL=silent", () => {
    const spy = mock.method(console, "error", () => {});
    logger.error("should not print");
    assert.equal(spy.mock.callCount(), 0);
    spy.mock.restore();
  });
});

describe("existing behaviour is unchanged (regression)", () => {
  test("protect without token still returns the same 401 message", async () => {
    const res = await fetch(base + "/api/users/me");
    assert.equal(res.status, 401);
    assert.equal((await json(res)).message, "No token, No Access!!!");
  });

  test("authorizeRoles still answers 401 (frontend logs out on 401, so this stays)", () => {
    const res = fakeRes();
    authorizeRoles("doctor")({ user: { role: "patient" } }, res, () => assert.fail("should not pass"));
    assert.equal(res.statusCode, 401);
    assert.equal(res.body.message, "Authorization denied!!!");
  });

  test("clean page URLs and static assets are still served", async () => {
    for (const p of ["/", "/login", "/about", "/assests/photos/logo.png", "/Frontend/CSS/style.css"]) {
      const res = await fetch(base + p);
      assert.equal(res.status, 200, p);
    }
  });
});
