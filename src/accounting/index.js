const readline = require('node:readline');

const INITIAL_BALANCE_CENTS = 100000;
const MAX_BALANCE_CENTS = 99999999;

function createBalanceStore() {
  let balanceCents = INITIAL_BALANCE_CENTS;

  return {
    read() {
      return balanceCents;
    },
    write(nextBalanceCents) {
      if (!Number.isInteger(nextBalanceCents) || nextBalanceCents < 0 || nextBalanceCents > MAX_BALANCE_CENTS) {
        return false;
      }

      balanceCents = nextBalanceCents;
      return true;
    },
  };
}

function formatAmount(amountCents) {
  return `${Math.floor(amountCents / 100)}.${String(amountCents % 100).padStart(2, '0')}`;
}

function parseAmount(input) {
  const match = /^(\d{1,6})(?:\.(\d{1,2}))?$/.exec(input);
  if (!match) {
    return null;
  }

  const wholeUnits = Number(match[1]);
  const fractionalUnits = Number((match[2] ?? '').padEnd(2, '0'));
  return wholeUnits * 100 + fractionalUnits;
}

async function main() {
  const terminal = readline.createInterface({
    input: process.stdin,
    crlfDelay: Infinity,
  });
  const lines = terminal[Symbol.asyncIterator]();
  const store = createBalanceStore();

  async function prompt(message) {
    process.stdout.write(message);
    const result = await lines.next();
    return result.done ? null : result.value.trim();
  }

  async function requestAmount(label) {
    while (true) {
      const input = await prompt(`Enter ${label} amount: `);
      if (input === null) {
        return null;
      }

      const amountCents = parseAmount(input);
      if (amountCents !== null) {
        return amountCents;
      }

      console.log('Invalid amount. Enter a value from 0.00 to 999999.99.');
    }
  }

  let shouldExit = false;
  while (!shouldExit) {
    console.log('--------------------------------');
    console.log('Account Management System');
    console.log('1. View Balance');
    console.log('2. Credit Account');
    console.log('3. Debit Account');
    console.log('4. Exit');
    console.log('--------------------------------');

    const choice = await prompt('Enter your choice (1-4): ');
    if (choice === null) {
      shouldExit = true;
      continue;
    }

    switch (choice) {
      case '1':
        console.log(`Current balance: ${formatAmount(store.read())}`);
        break;
      case '2': {
        const amountCents = await requestAmount('credit');
        if (amountCents === null) {
          shouldExit = true;
          break;
        }

        const newBalanceCents = store.read() + amountCents;
        if (store.write(newBalanceCents)) {
          console.log(`Amount credited. New balance: ${formatAmount(store.read())}`);
        } else {
          console.log('Credit would exceed the maximum account balance.');
        }
        break;
      }
      case '3': {
        const amountCents = await requestAmount('debit');
        if (amountCents === null) {
          shouldExit = true;
          break;
        }

        const currentBalanceCents = store.read();
        if (currentBalanceCents >= amountCents) {
          store.write(currentBalanceCents - amountCents);
          console.log(`Amount debited. New balance: ${formatAmount(store.read())}`);
        } else {
          console.log('Insufficient funds for this debit.');
        }
        break;
      }
      case '4':
        shouldExit = true;
        break;
      default:
        console.log('Invalid choice, please select 1-4.');
    }
  }

  terminal.close();
  console.log('Exiting the program. Goodbye!');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});