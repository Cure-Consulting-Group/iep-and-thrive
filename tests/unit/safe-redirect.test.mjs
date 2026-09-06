import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import vm from 'node:vm'
import ts from 'typescript'

const source = ts.transpileModule(readFileSync('lib/safe-redirect.ts', 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText
const module = { exports: {} }
vm.runInNewContext(source, { module, exports: module.exports, URL })
const { safeNextPath } = module.exports

test('rejects an absolute external URL', () => {
  assert.equal(safeNextPath('https://evil.com'), null)
})

test('rejects a protocol-relative external URL', () => {
  assert.equal(safeNextPath('//evil.com'), null)
})

test('rejects a backslash-based external URL', () => {
  assert.equal(safeNextPath('/\\evil.com'), null)
})

test('rejects a javascript URL', () => {
  assert.equal(safeNextPath('javascript:alert(1)'), null)
})

test('accepts a local path with query and fragment', () => {
  assert.equal(
    safeNextPath('/portal/students/abc?tab=sessions#top'),
    '/portal/students/abc?tab=sessions#top',
  )
})

test('rejects encoded authorities and traversal', () => {
  assert.equal(safeNextPath('/%2f%2fevil.com'), null)
  assert.equal(safeNextPath('/portal/%2e%2e/admin'), null)
})

test('rejects missing or non-path destinations', () => {
  assert.equal(safeNextPath(null), null)
  assert.equal(safeNextPath('portal'), null)
  assert.equal(safeNextPath(''), null)
})
