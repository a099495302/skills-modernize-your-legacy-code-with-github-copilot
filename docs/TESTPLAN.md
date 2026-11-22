# School Account Management Test Plan

This plan describes the behavior implemented by the current COBOL application. Run each case in a fresh application process unless the preconditions specify multiple actions in one session. The account starts at `1000.00` for each process, and its changes are held only in memory.

The **Actual Result** and **Status** columns are intentionally blank for execution. Record the observed output and mark each case Pass or Fail when validating with stakeholders.

|Test Case ID|Test Case Description|Pre-conditions|Test Steps|Expected Result|Actual Result|Status (Pass/Fail)|Comments|
|---|---|---|---|---|---|---|---|
|ACCT-001|Display the initial balance|Start a new application process.|1. Select `1` (View Balance).|The application displays a current balance of `1000.00`.|||Covers the initial value in `DataProgram`.|
|ACCT-002|Reject an invalid menu choice and continue|Application is at the menu.|1. Enter `5`. 2. At the next prompt, select `1`.|The application displays an invalid-choice message, shows the menu again, and then displays the unchanged balance of `1000.00`.|||Covers the `OTHER` menu branch.|
|ACCT-003|View the balance without changing it|Start a new application process.|1. Select `1` twice.|Both balance displays show `1000.00`; viewing does not change the stored balance.|||Covers the `TOTAL` operation and repeated reads.|
|ACCT-004|Credit a positive amount|Start a new application process.|1. Select `2` (Credit Account). 2. Enter `125.50`.|The application reports the amount credited and displays a new balance of `1125.50`.|||Confirms credit arithmetic and stored write.|
|ACCT-005|Retain a credit during the same session|Start a new application process.|1. Credit `125.50`. 2. Select `1` (View Balance).|The credit operation displays `1125.50`; the subsequent view also displays `1125.50`.|||Confirms a write can be read back in the running process.|
|ACCT-006|Debit less than the available balance|Start a new application process.|1. Select `3` (Debit Account). 2. Enter `125.50`.|The application reports the debit and displays a new balance of `874.50`.|||Covers successful debit arithmetic and stored write.|
|ACCT-007|Debit the exact available balance|Start a new application process.|1. Select `3`. 2. Enter `1000.00`. 3. Select `1`.|The debit succeeds and the balance is `0.00`; the subsequent view also shows `0.00`.|||The rule permits a debit when balance equals amount.|
|ACCT-008|Reject a debit greater than the available balance|Start a new application process.|1. Select `3`. 2. Enter `1000.01`. 3. Select `1`.|The application displays an insufficient-funds message. The balance remains `1000.00` and is unchanged on the subsequent view.|||Confirms a rejected debit does not write a changed balance.|
|ACCT-009|Credit zero|Start a new application process.|1. Select `2`. 2. Enter `0.00`. 3. Select `1`.|The current implementation reports the credit as successful and the balance remains `1000.00`.|||No positive-amount validation is implemented. Confirm this behavior is acceptable to stakeholders.|
|ACCT-010|Debit zero|Start a new application process.|1. Select `3`. 2. Enter `0.00`. 3. Select `1`.|The current implementation reports the debit as successful and the balance remains `1000.00`.|||Zero meets the `balance >= amount` condition. Confirm this behavior is acceptable to stakeholders.|
|ACCT-011|Apply multiple transactions in order|Start a new application process.|1. Credit `200.00`. 2. Debit `50.00`. 3. Select `1`.|The final balance is `1150.00`, and the final view displays `1150.00`.|||Confirms each operation uses the balance written by the previous operation.|
|ACCT-012|Reset the balance after process restart|Start a new application process.|1. Credit `200.00`. 2. Exit with `4`. 3. Start a new process. 4. Select `1`.|The new process displays `1000.00`; the earlier change was not persisted across processes.|||Documents current in-memory-only storage, not a desired future student-ledger rule.|
|ACCT-013|Exit the application|Application is at the menu.|1. Select `4`.|The application displays its goodbye message and terminates without showing another menu.|||Covers the exit branch.|

## Items for Stakeholder Decisions

- The code has no explicit validation policy for negative, nonnumeric, or out-of-range amounts. COBOL input and numeric-field behavior may depend on the compiler/runtime, so this plan does not assign expected results for those inputs. Define the desired rules before adding corresponding COBOL or Node.js tests.
- The current implementation has one shared balance, no student identifier, and no transaction history. Per-student isolation and audit-history tests require business requirements and functionality that are not present in this application.

Revisit these decisions when defining the Node.js behavior.
