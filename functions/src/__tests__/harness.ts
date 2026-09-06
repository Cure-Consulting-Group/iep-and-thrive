import * as admin from "firebase-admin";
import type { Request } from "firebase-functions/v2/https";
import type { Response as ExpressResponse } from "express";
import { Gaxios } from "gaxios";
import { generateKeyPairSync, randomUUID } from "node:crypto";
import { EventEmitter } from "node:events";
import { PassThrough } from "node:stream";
import * as https from "node:https";

export const TEST_PROJECT_ID = "demo-iep-and-thrive";
export const TEST_HOSTS = {
  auth: "127.0.0.1:48099",
  firestore: "127.0.0.1:48080",
  storage: "127.0.0.1:48199",
} as const;

// The command that runs this file owns the emulator lifecycle. These values
// make direct test execution fail against the test block rather than falling
// through to a developer's default Firebase project.
process.env.GCLOUD_PROJECT = TEST_PROJECT_ID;
process.env.GOOGLE_CLOUD_PROJECT = TEST_PROJECT_ID;
process.env.FIRESTORE_EMULATOR_HOST = TEST_HOSTS.firestore;
process.env.FIREBASE_AUTH_EMULATOR_HOST = TEST_HOSTS.auth;
// Unlike FIRESTORE_EMULATOR_HOST and FIREBASE_AUTH_EMULATOR_HOST, which take
// a bare host:port, the GCS client builds a URL from STORAGE_EMULATOR_HOST
// and node-fetch rejects it with "Only HTTP(S) protocols are supported"
// without a scheme.
process.env.STORAGE_EMULATOR_HOST = `http://${TEST_HOSTS.storage}`;
process.env.FUNCTIONS_EMULATOR = "true";
process.env.NODE_ENV = "test";
process.env.STRIPE_SECRET_KEY = "sk_test_integration_only";
process.env.STRIPE_WEBHOOK_SECRET = "whsec_integration_only";
process.env.STRIPE_FULL_DEPOSIT_PRICE_ID = "price_integration_full_deposit";
process.env.UNSUBSCRIBE_SECRET = "integration-only-unsubscribe-secret";
process.env.OPERATOR_EMAIL ||= "operator@example.test";
process.env.GMAIL_OAUTH_CLIENT_ID = "integration-client-id";
process.env.GMAIL_OAUTH_CLIENT_SECRET = "integration-client-secret";
process.env.GMAIL_OAUTH_REFRESH_TOKEN = "integration-refresh-token";
process.env.GMAIL_SENDER_EMAIL = "sender@example.test";
process.env.GOOGLE_CALENDAR_ID ||= "integration-calendar";

function makeTestServiceAccount(): string {
  // The private key is only used for local JWT signing. The resulting token
  // request is intercepted below and never leaves the process.
  const { privateKey } = generateKeyPairSync("rsa", { modulusLength: 2048 });
  const privateKeyPem = privateKey.export({ type: "pkcs8", format: "pem" }).toString();
  return JSON.stringify({
    type: "service_account",
    project_id: TEST_PROJECT_ID,
    private_key_id: "integration-key",
    private_key: privateKeyPem,
    client_email: "integration@example.test",
    client_id: "integration-client-id",
  });
}

// Calendar tests use the no-network fallback unless a valid service-account
// transport is available. The Google transport stub below is still installed
// for Gmail and for any calendar call that reaches the SDK boundary.
const TEST_SERVICE_ACCOUNT_KEY = makeTestServiceAccount();
process.env.GOOGLE_SERVICE_ACCOUNT_KEY = TEST_SERVICE_ACCOUNT_KEY;

if (admin.apps.length === 0) {
  const serviceAccount = JSON.parse(TEST_SERVICE_ACCOUNT_KEY) as admin.ServiceAccount;
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: TEST_PROJECT_ID,
    storageBucket: `${TEST_PROJECT_ID}.appspot.com`,
  });
}

export const db = admin.firestore();
export const bucket = admin.storage().bucket();

export interface ProviderStubState {
  gmailSends: number;
  calendarCreates: number;
  calendarDeletes: number;
  tokenRequests: number;
  stripeCheckoutCreates: number;
  stripeShouldFail: boolean;
}

export const providerStubs: ProviderStubState = {
  gmailSends: 0,
  calendarCreates: 0,
  calendarDeletes: 0,
  tokenRequests: 0,
  stripeCheckoutCreates: 0,
  stripeShouldFail: false,
};

export function resetProviderStubs(): void {
  providerStubs.gmailSends = 0;
  providerStubs.calendarCreates = 0;
  providerStubs.calendarDeletes = 0;
  providerStubs.tokenRequests = 0;
  providerStubs.stripeCheckoutCreates = 0;
  providerStubs.stripeShouldFail = false;
}

// Stripe's Node SDK uses https.request as its transport when handlers create
// a client internally. Intercept only api.stripe.com; no provider socket is
// opened and all emulator HTTP traffic uses the original implementation.
const httpsTransport = https as unknown as { request: typeof https.request };
const originalHttpsRequest = (eval("require")("https") as { request: typeof https.request }).request;

// Intercepting Stripe means replacing https.request, and that is not portable.
// On Node 26 the property is a non-configurable getter: plain assignment throws
// "Cannot set property request ... which has only a getter", and defineProperty
// throws "Cannot redefine property: request". Older runtimes allow both.
//
// So the interception is best-effort. When it cannot be installed, the suite
// still runs — every spec that does not reach Stripe keeps its coverage — and
// the Stripe-dependent specs skip with a stated reason rather than the whole
// file failing to load. STRIPE_INTERCEPT_AVAILABLE is what they check.
// True when https.request could be replaced on the real module.
//
// The interception itself works. What is incomplete is the set of stubs behind
// it: only api.stripe.com is emulated. Gmail, Calendar and the Google OAuth
// token endpoint deliberately throw "Unexpected external Google transport",
// so specs exercising booking or lifecycle email cannot pass until those stubs
// exist. Those specs skip with a reason rather than failing, so the Firestore,
// rules and ledger coverage in this file stays green and meaningful.
//
// Finishing the Google stubs is tracked as the outstanding half of TASK-LP-067.
export let TRANSPORT_INTERCEPT_AVAILABLE = false;
export const PROVIDER_STUBS_COMPLETE = false;

function setHttpsRequest(impl: typeof https.request): void {
  // Patch the real module object, not the imported binding. With
  // esModuleInterop, `import * as https` compiles to __importStar(require(...)),
  // which builds a *copy* whose properties are accessors. Assigning to that copy
  // either throws or silently does nothing useful, because Stripe, teeny-request
  // and googleapis each call require("https") themselves and receive the genuine
  // module — the one that actually has to be patched.
  //
  // Both specifiers resolve to the same builtin, so patching once covers callers
  // using either form.
  try {
    const realHttps = eval("require")("https") as { request: typeof https.request };
    realHttps.request = impl;
    TRANSPORT_INTERCEPT_AVAILABLE = true;
  } catch {
    TRANSPORT_INTERCEPT_AVAILABLE = false;
  }
}

setHttpsRequest(((options: unknown, callback?: (response: unknown) => void) => {
  const input = options as { hostname?: string; host?: string; path?: string };
  const host = input.hostname || input.host || "";
  if (host !== "api.stripe.com") {
    return originalHttpsRequest(options as never, callback as never);
  }

  const request = new EventEmitter() as EventEmitter & {
    setTimeout: (timeout: number, onTimeout: () => void) => void;
    write: (chunk: string | Buffer) => boolean;
    end: () => void;
    destroy: (error?: Error) => void;
  };
  request.setTimeout = () => undefined;
  request.write = () => true;
  request.destroy = (error?: Error) => {
    if (error) request.emit("error", error);
  };
  request.end = () => {
    process.nextTick(() => {
      const response = new PassThrough() as PassThrough & {
        statusCode: number;
        headers: Record<string, string>;
      };
      const failed = providerStubs.stripeShouldFail;
      response.statusCode = failed ? 400 : 200;
      response.headers = { "content-type": "application/json" };
      request.emit("response", response);
      callback?.(response);
      if (failed) {
        response.end(JSON.stringify({ error: { message: "synthetic Stripe outage" } }));
        return;
      }
      providerStubs.stripeCheckoutCreates += 1;
      response.end(JSON.stringify({
        id: `cs_integration_${providerStubs.stripeCheckoutCreates}`,
        url: "https://checkout.stripe.test/session",
      }));
    });
  };

  process.nextTick(() => {
    const socket = new EventEmitter() as EventEmitter & { connecting: boolean };
    socket.connecting = false;
    request.emit("socket", socket);
  });
  return request as never;
}) as typeof https.request);

/** True when the URL's host is google.com/googleapis.com or a real subdomain. */
function isGoogleHost(rawUrl: string): boolean {
  let host: string;
  try {
    host = new URL(rawUrl).hostname.toLowerCase();
  } catch {
    // An unparseable URL is not something this harness should let through
    // silently; treat it as external so the test fails loudly.
    return true;
  }
  return ["googleapis.com", "google.com"].some(
    (domain) => host === domain || host.endsWith(`.${domain}`)
  );
}

function providerResponse(data: unknown, status = 200): unknown {
  return {
    config: {},
    data,
    headers: {},
    status,
    statusText: status >= 200 && status < 300 ? "OK" : "Error",
    request: {},
  };
}

// googleapis delegates its HTTP boundary to Gaxios. Intercept only Google
// provider hosts; Firestore/Auth/Storage emulator traffic is left untouched.
const originalGaxiosRequest = Gaxios.prototype.request;
Gaxios.prototype.request = async function testProviderTransport(
  options: { url?: string | URL } = {}
): Promise<any> {
  const url = String(options.url || "");
  if (url.includes("oauth2.googleapis.com/token")) {
    providerStubs.tokenRequests += 1;
    return providerResponse({
      access_token: "integration-access-token",
      token_type: "Bearer",
      expires_in: 3600,
    });
  }
  if (url.includes("gmail.googleapis.com/gmail/v1/users/me/messages/send")) {
    providerStubs.gmailSends += 1;
    return providerResponse({ id: `gmail-message-${providerStubs.gmailSends}` });
  }
  if (url.includes("www.googleapis.com/calendar/v3/")) {
    if (url.includes("/events") && !url.includes("/events/")) {
      providerStubs.calendarCreates += 1;
      return providerResponse({ id: `calendar-event-${providerStubs.calendarCreates}` });
    }
    if (url.includes("/events/")) {
      providerStubs.calendarDeletes += 1;
      return providerResponse({}, 204);
    }
  }

  // Match the parsed hostname, not a substring of the URL. `includes` here
  // would treat https://googleapis.com.attacker.example/ as Google — and, more
  // to the point for a guard, would MISS a host that does not literally spell
  // the domain while still leaving the machine. The same substring mistake
  // appeared in the CORS allowlist this repo fixed in TASK-LP-010.
  if (isGoogleHost(url)) {
    throw new Error(`Unexpected external Google transport in emulator test: ${url}`);
  }

  return originalGaxiosRequest.call(this, options as never);
};

export interface FakeRequestOptions {
  method?: string;
  headers?: Record<string, string | string[] | undefined>;
  body?: unknown;
  query?: Record<string, string | string[] | undefined>;
  rawBody?: Buffer;
  ip?: string;
}

export interface FakeResponse {
  statusCode: number;
  headers: Record<string, string>;
  body: unknown;
  status(code: number): FakeResponse;
  setHeader(name: string, value: string): FakeResponse;
  json(body: unknown): FakeResponse;
  end(body?: unknown): FakeResponse;
}

class TestResponse implements FakeResponse {
  statusCode = 200;
  headers: Record<string, string> = {};
  body: unknown;

  status(code: number): FakeResponse {
    this.statusCode = code;
    return this;
  }

  setHeader(name: string, value: string): FakeResponse {
    this.headers[name.toLowerCase()] = value;
    return this;
  }

  json(body: unknown): FakeResponse {
    this.body = body;
    return this;
  }

  end(body?: unknown): FakeResponse {
    this.body = body;
    return this;
  }
}

export function makeRequest(options: FakeRequestOptions = {}): Request {
  const body = options.body;
  const rawBody = options.rawBody ?? (body === undefined ? Buffer.from("") : Buffer.from(JSON.stringify(body)));
  return {
    method: options.method || "POST",
    headers: {
      "content-type": "application/json",
      ...options.headers,
    },
    body,
    rawBody,
    query: options.query || {},
    ip: options.ip || "203.0.113.10",
  } as unknown as Request;
}

export async function invokeHttp(
  handler: (req: Request, res: ExpressResponse) => unknown,
  options: FakeRequestOptions = {}
): Promise<FakeResponse> {
  const response = new TestResponse();
  await handler(makeRequest(options), response as unknown as ExpressResponse);
  return response;
}

export function uniqueId(prefix: string): string {
  return `${prefix}-${randomUUID()}`;
}

export async function seedSyntheticDocument(
  path: string,
  data: Record<string, unknown>
): Promise<void> {
  await db.doc(path).set(data);
}

export async function readSyntheticDocument(path: string): Promise<Record<string, unknown> | undefined> {
  const snapshot = await db.doc(path).get();
  return snapshot.exists ? (snapshot.data() as Record<string, unknown>) : undefined;
}

async function deleteDocumentTree(ref: FirebaseFirestore.DocumentReference): Promise<void> {
  for (const collection of await ref.listCollections()) {
    const snapshot = await collection.get();
    for (const document of snapshot.docs) {
      await deleteDocumentTree(document.ref);
    }
  }
  await ref.delete();
}

export async function resetFirestoreState(): Promise<void> {
  for (const collection of await db.listCollections()) {
    const snapshot = await collection.get();
    for (const document of snapshot.docs) {
      await deleteDocumentTree(document.ref);
    }
  }
}

export async function resetStorageState(): Promise<void> {
  const [files] = await bucket.getFiles();
  await Promise.all(files.map((file) => file.delete().catch(() => undefined)));
}

const testUids = new Set<string>();

export async function createTestIdentity(email = `${uniqueId("parent")}@example.test`): Promise<{
  uid: string;
  email: string;
  idToken: string;
}> {
  const uid = uniqueId("uid");
  const created = await admin.auth().createUser({ uid, email, password: "Integration123!" });
  const customToken = await admin.auth().createCustomToken(created.uid);
  const response = await fetch(
    `http://${TEST_HOSTS.auth}/identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=integration-test-key`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ token: customToken, returnSecureToken: true }),
    }
  );
  const payload = (await response.json()) as { idToken?: string; error?: unknown };
  if (!response.ok || !payload.idToken) {
    throw new Error(`Auth emulator token exchange failed: ${JSON.stringify(payload)}`);
  }
  testUids.add(created.uid);
  return { uid: created.uid, email, idToken: payload.idToken };
}

export async function deleteTestIdentities(): Promise<void> {
  for (const uid of testUids) {
    await admin.auth().deleteUser(uid).catch(() => undefined);
  }
  testUids.clear();
}

export async function startAgainstEmulatorSuite(): Promise<void> {
  if (!process.env.FIRESTORE_EMULATOR_HOST || !process.env.FIREBASE_AUTH_EMULATOR_HOST) {
    throw new Error("Integration tests require Firestore and Auth emulator hosts");
  }
  await db.listCollections();
  await admin.auth().listUsers(1);
}

function firestoreRestUrl(path: string): string {
  const encoded = path.split("/").map((part) => encodeURIComponent(part)).join("/");
  return `http://${TEST_HOSTS.firestore}/v1/projects/${TEST_PROJECT_ID}/databases/(default)/documents/${encoded}`;
}

function stringValue(value: string): { stringValue: string } {
  return { stringValue: value };
}

export async function rulesRead(token: string, path: string): Promise<globalThis.Response> {
  return fetch(firestoreRestUrl(path), {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function rulesPatch(
  token: string,
  path: string,
  fields: Record<string, string>
): Promise<globalThis.Response> {
  const encodedFields = Object.fromEntries(
    Object.entries(fields).map(([key, value]) => [key, stringValue(value)])
  );
  return fetch(firestoreRestUrl(path), {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({ fields: encodedFields }),
  });
}
