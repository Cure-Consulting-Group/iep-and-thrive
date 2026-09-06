import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import vm from 'node:vm'
import ts from 'typescript'

// Execute the actual provider with deterministic Firebase and React hook adapters.
const source = ts.transpileModule(readFileSync('lib/auth-context.tsx', 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX },
}).outputText
function harness(getDoc = async () => ({ exists: () => true, data: () => ({ role: 'admin', uid: 'forged' }) })) {
  const state = []
  const writes = []
  let listener
  const modules = {
    react: {
      createContext: () => ({ Provider: {} }),
      useState: initial => { const index = state.length; state.push(initial); return [initial, value => { state[index] = value; writes.push([index, value]) }] },
      useEffect: callback => callback(),
      useRef: initial => ({ current: initial }),
    },
    'react/jsx-runtime': { jsx: () => null },
    'firebase/auth': { GoogleAuthProvider: class {}, onIdTokenChanged: (_, callback) => { listener = callback; return () => {} } },
    'firebase/firestore': { doc: () => ({}), getDoc },
    '@/lib/firebase': { auth: {}, db: {} },
  }
  const context = { exports: {}, require: name => {
    assert.ok(name in modules, `Unexpected dependency ${name}`)
    return modules[name]
  }, console: { error() {} } }
  vm.runInNewContext(source, context)
  context.exports.AuthProvider({ children: null })
  return { state, writes, emit: user => listener(user) }
}
const PROFILE = 1
const LOADING = 2
const user = claims => ({ uid: 'parent-a', getIdTokenResult: async () => ({ claims }) })

test('forged profile admin role and uid cannot override verified identity', async () => {
  const h = harness()
  await h.emit(user({}))
  assert.equal(h.state[1].role, 'parent')
  assert.equal(h.state[1].uid, 'parent-a')
  assert.equal(h.state[2], false)
})
test('admin requires boolean token claim and responds to refreshed claims', async () => {
  const h = harness()
  await h.emit(user({ admin: true }))
  assert.equal(h.state[1].role, 'admin')
  await h.emit(user({ admin: 'true' }))
  assert.equal(h.state[1].role, 'parent')
})
test('late profile response cannot restore admin UI after sign-out', async () => {
  let resolve
  const h = harness(() => new Promise(done => { resolve = done }))
  const pending = h.emit(user({ admin: true }))
  await h.emit(null)
  resolve({ exists: () => true, data: () => ({ role: 'admin' }) })
  await pending
  assert.equal(h.state[0], null)
  assert.equal(h.state[1], null)
  assert.equal(h.state[2], false)
})
test('failed token lookup leaves admin UI inaccessible', async () => {
  const h = harness()
  await h.emit({ uid: 'parent-a', getIdTokenResult: async () => { throw Error('unavailable') } })
  assert.equal(h.state[1], null)
  assert.equal(h.state[2], false)
})

test('silent token refresh for the same user does not tear down the tree', async () => {
  const h = harness()
  await h.emit(user({ admin: true }))
  h.writes.length = 0
  // Firebase refreshes the ID token roughly hourly and re-fires the listener.
  await h.emit(user({ admin: true }))
  assert.deepEqual(
    h.writes.filter(([index, value]) => index === LOADING && value === true), [],
    'a same-user refresh must not re-enter the loading state; ProtectedRoute would remount its children and discard form state',
  )
  assert.deepEqual(
    h.writes.filter(([index, value]) => index === PROFILE && value === null), [],
    'a same-user refresh must not blank the profile',
  )
  assert.equal(h.state[PROFILE].role, 'admin')
})

test('a refresh that fails transiently keeps the admin profile on screen', async () => {
  const h = harness()
  await h.emit(user({ admin: true }))
  assert.equal(h.state[PROFILE].role, 'admin')
  await h.emit({ uid: 'parent-a', getIdTokenResult: async () => { throw Error('offline') } })
  assert.equal(h.state[PROFILE].role, 'admin', 'a transient refresh failure must not drop the role and bounce an admin to /portal')
  assert.equal(h.state[LOADING], false)
})
