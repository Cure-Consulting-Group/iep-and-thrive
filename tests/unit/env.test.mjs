import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import vm from 'node:vm'
import ts from 'typescript'

// Execute the real lib/env.ts rather than a copy, so the assertions cannot
// drift from the shipped resolver.
const source = ts.transpileModule(readFileSync('lib/env.ts', 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS },
}).outputText
const context = { exports: {}, require: () => ({}), process: { env: {} } }
vm.runInNewContext(source, context)
const {
  resolveEnvironment,
  assertEnvironmentCoherent,
  PRODUCTION_PROJECT_ID,
} = context.exports

// The class is transpiled inside a vm context, so its constructor identity does
// not survive for `assert.throws(fn, Ctor)`. Match on the name instead.
const isConfigError = (err) => err?.name === 'EnvironmentConfigError'

const PROD = PRODUCTION_PROJECT_ID

test('explicit NEXT_PUBLIC_FIREBASE_ENV wins over hostname', () => {
  // A deployed staging build must not be reclassified by its hostname.
  assert.equal(resolveEnvironment('staging', 'localhost'), 'staging')
  assert.equal(resolveEnvironment('production', 'localhost'), 'production')
  assert.equal(resolveEnvironment('local', 'app.example.com'), 'local')
})

test('127.0.0.1 resolves local, not production', () => {
  // The original bug: only the literal string "localhost" counted as local, so
  // the same machine on a different spelling talked to production.
  for (const host of ['localhost', '127.0.0.1', '::1', '[::1]', '0.0.0.0']) {
    assert.equal(resolveEnvironment(undefined, host), 'local', `${host} should be local`)
  }
})

test('unknown hostname defaults to production', () => {
  assert.equal(resolveEnvironment(undefined, 'iep-and-thrive.web.app'), 'production')
  assert.equal(resolveEnvironment(undefined, null), 'production')
})

test('an unrecognized env value is rejected rather than guessed', () => {
  assert.throws(() => resolveEnvironment('prod', null), isConfigError)
  assert.throws(() => resolveEnvironment('dev', null), isConfigError)
})

test('local or staging pointed at the production project is refused', () => {
  assert.throws(
    () => assertEnvironmentCoherent('local', { projectId: PROD }),
    isConfigError,
  )
  assert.throws(
    () => assertEnvironmentCoherent('staging', { projectId: PROD }),
    isConfigError,
  )
})

test('production pointed at a non-production project is refused', () => {
  assert.throws(
    () => assertEnvironmentCoherent('production', { projectId: 'iep-staging' }),
    isConfigError,
  )
})

test('auth domain or storage bucket from another project is refused', () => {
  assert.throws(
    () => assertEnvironmentCoherent('production', {
      projectId: PROD,
      authDomain: 'iep-staging.firebaseapp.com',
    }),
    isConfigError,
  )
  assert.throws(
    () => assertEnvironmentCoherent('production', {
      projectId: PROD,
      storageBucket: 'iep-staging.appspot.com',
    }),
    isConfigError,
  )
})

test('absent config is not an error', () => {
  // CI checkouts legitimately have no .env.local; treating absence as fatal
  // would break `next build` for everyone. Only contradictions are fatal.
  assert.doesNotThrow(() => assertEnvironmentCoherent('production', {}))
  assert.doesNotThrow(() => assertEnvironmentCoherent('local', {}))
})

test('a coherent production config passes', () => {
  assert.doesNotThrow(() =>
    assertEnvironmentCoherent('production', {
      projectId: PROD,
      authDomain: `${PROD}.firebaseapp.com`,
      storageBucket: `${PROD}.appspot.com`,
    }),
  )
})

test('a coherent staging config passes', () => {
  assert.doesNotThrow(() =>
    assertEnvironmentCoherent('staging', {
      projectId: 'iep-and-thrive-staging',
      authDomain: 'iep-and-thrive-staging.firebaseapp.com',
      storageBucket: 'iep-and-thrive-staging.appspot.com',
    }),
  )
})
