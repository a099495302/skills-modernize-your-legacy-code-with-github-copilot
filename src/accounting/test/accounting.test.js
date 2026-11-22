const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const path = require('node:path');
const { test } = require('node:test');

const applicationPath = path.join(__dirname, '..', 'index.js');

function runApplication(choices) {
  const result = spawnSync(process.execPath, [applicationPath], {
    input: `${choices.join('\n')}\n`,
    encoding: 'utf8',
  });

  assert.ifError(result.error);
  assert.equal(result.status, 0, result.stderr);
  return result.stdout;
}

function countOccurrences(output, text) {
  return output.split(text).length - 1;
}

test('ACCT-001 displays the initial balance', () => {
  const output = runApplication(['1', '4']);

  assert.match(output, /Current balance: 1000\.00/);
});

test('ACCT-002 rejects an invalid menu choice and continues', () => {
  const output = runApplication(['5', '1', '4']);

  assert.match(output, /Invalid choice, please select 1-4\./);
  assert.equal(countOccurrences(output, 'Account Management System'), 3);
  assert.match(output, /Current balance: 1000\.00/);
});

test('ACCT-003 viewing the balance twice does not change it', () => {
  const output = runApplication(['1', '1', '4']);

  assert.equal(countOccurrences(output, 'Current balance: 1000.00'), 2);
});

test('ACCT-004 credits a positive amount', () => {
  const output = runApplication(['2', '125.50', '4']);

  assert.match(output, /Amount credited\. New balance: 1125\.50/);
});

test('ACCT-005 retains a credit during the same session', () => {
  const output = runApplication(['2', '125.50', '1', '4']);

  assert.match(output, /Amount credited\. New balance: 1125\.50/);
  assert.match(output, /Current balance: 1125\.50/);
});

test('ACCT-006 debits less than the available balance', () => {
  const output = runApplication(['3', '125.50', '4']);

  assert.match(output, /Amount debited\. New balance: 874\.50/);
});

test('ACCT-007 allows a debit equal to the available balance', () => {
  const output = runApplication(['3', '1000.00', '1', '4']);

  assert.match(output, /Amount debited\. New balance: 0\.00/);
  assert.match(output, /Current balance: 0\.00/);
});

test('ACCT-008 rejects a debit above the available balance without changing it', () => {
  const output = runApplication(['3', '1000.01', '1', '4']);

  assert.match(output, /Insufficient funds for this debit\./);
  assert.match(output, /Current balance: 1000\.00/);
  assert.doesNotMatch(output, /Amount debited/);
});

test('ACCT-009 accepts a zero credit without changing the balance', () => {
  const output = runApplication(['2', '0.00', '1', '4']);

  assert.match(output, /Amount credited\. New balance: 1000\.00/);
  assert.match(output, /Current balance: 1000\.00/);
});

test('ACCT-010 accepts a zero debit without changing the balance', () => {
  const output = runApplication(['3', '0.00', '1', '4']);

  assert.match(output, /Amount debited\. New balance: 1000\.00/);
  assert.match(output, /Current balance: 1000\.00/);
});

test('ACCT-011 applies multiple transactions in order', () => {
  const output = runApplication(['2', '200.00', '3', '50.00', '1', '4']);

  assert.match(output, /Amount credited\. New balance: 1200\.00/);
  assert.match(output, /Amount debited\. New balance: 1150\.00/);
  assert.match(output, /Current balance: 1150\.00/);
});

test('ACCT-012 resets the balance after the process restarts', () => {
  const firstProcess = runApplication(['2', '200.00', '4']);
  const secondProcess = runApplication(['1', '4']);

  assert.match(firstProcess, /Amount credited\. New balance: 1200\.00/);
  assert.match(secondProcess, /Current balance: 1000\.00/);
});

test('ACCT-013 exits without displaying another menu', () => {
  const output = runApplication(['4']);

  assert.match(output, /Exiting the program\. Goodbye!/);
  assert.equal(countOccurrences(output, 'Account Management System'), 1);
});