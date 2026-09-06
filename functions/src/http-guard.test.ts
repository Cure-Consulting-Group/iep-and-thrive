import assert from "node:assert/strict";
import test from "node:test";
import type { Request } from "firebase-functions/v2/https";
import type { Response } from "express";
import {
  assertBodySize,
  assertContentType,
  assertMethod,
  errorEnvelope,
  rejectQuota,
} from "./http-guard";

interface TestResponse {
  statusCode: number;
  headers: Record<string, string>;
  body: unknown;
  status(code: number): TestResponse;
  setHeader(name: string, value: string): TestResponse;
  json(body: unknown): TestResponse;
}

function response(): TestResponse {
  return {
    statusCode: 200,
    headers: {},
    body: undefined,
    status(code) {
      this.statusCode = code;
      return this;
    },
    setHeader(name, value) {
      this.headers[name.toLowerCase()] = value;
      return this;
    },
    json(body) {
      this.body = body;
      return this;
    },
  };
}

function request(overrides: Record<string, unknown> = {}): Request {
  return {
    method: "POST",
    headers: {},
    ip: "203.0.113.10",
    ...overrides,
  } as unknown as Request;
}

test("method rejection sets 405 and Allow", () => {
  const res = response();

  assert.equal(assertMethod(request({ method: "GET" }), res as unknown as Response, ["POST"]), false);
  assert.equal(res.statusCode, 405);
  assert.equal(res.headers.allow, "POST");
});

test("content-type rejection sets 415", () => {
  const res = response();

  assert.equal(
    assertContentType(
      request({ headers: { "content-type": "text/plain" } }),
      res as unknown as Response
    ),
    false
  );
  assert.equal(res.statusCode, 415);
});

test("oversize body rejection sets 413 before parsing", () => {
  const res = response();

  assert.equal(
    assertBodySize(
      request({ headers: { "content-length": "1001" } }),
      res as unknown as Response,
      1000
    ),
    false
  );
  assert.equal(res.statusCode, 413);
});

test("over-limit quota responds with 429 and Retry-After", () => {
  const res = response();

  assert.equal(rejectQuota(res as unknown as Response, 37), false);
  assert.equal(res.statusCode, 429);
  assert.equal(res.headers["retry-after"], "37");
  // `error` is a string, not an object. Clients read it directly
  // (app/enroll/agreement/page.tsx, app/unsubscribe/page.tsx), so nesting the
  // message rendered "[object Object]" to a parent.
  assert.deepEqual(res.body, {
    error: "Too many requests right now. Please wait a moment and try again.",
    code: "quota_exceeded",
  });
});

test("error envelope never echoes input", () => {
  const res = response();
  const offendingInput = "do-not-echo-this-secret";

  errorEnvelope(res as unknown as Response, 400, "invalid_request", "Invalid form data.");

  assert.equal(JSON.stringify(res.body).includes(offendingInput), false);
  assert.deepEqual(res.body, {
    error: "Invalid form data.",
    code: "invalid_request",
  });
  assert.equal(typeof res.body.error, "string", "clients render this value directly");
});
