# KAI Finance Security Research - POC Repo
Proof of Concept (POC) exploits and technical analysis for the **KAI Finance Yield Protocol** on Sui.

## Overview

KAI Finance is a leveraged yield protocol built on the Sui blockchain. Our audit has identified 2 critical vulnerabilities that could lead to protocol insolvency and loss of user funds.

## Findings Summary

| ID | Severity | Finding | Impact |
| --- | --- | --- | --- |
| #1 | **CRITICAL** | Rate Limiter Counts Principal Only | TVL Guardrail Bypass via Leverage |
| #2 | **CRITICAL** | SAV Vault First Depositor Inflation | Steal from future depositors |

---

## Technical Details

### #1 - Rate Limiter Counts Principal Only (CRITICAL)
**Vulnerability**: The rate limiter is designed to protect against rapid TVL expansion, but it only counts the user's principal collateral, not the borrowed amount. At 11x leverage, a user deposits $100K principal but the vault receives $1.1M in total position value. The protection is 11x weaker than intended.
**Code**: `kai/leverage/core/sources/position_core.move`
`create_position_ticket` macro
**POC**: [finding_1_poc.ts](finding_1_poc.ts)

### #2 - SAV Vault First Depositor Inflation (CRITICAL)
**Vulnerability**: The vault's `deposit()` function uses floor division for calculating LP shares on all subsequent deposits after the first. A classic ERC4626 inflation attack allows the first depositor to steal from all future depositors by directly donating to the vault's free balance.
**Code**: `kai/sav/core/sources/vault.move`
`deposit` function
**POC**: [finding_2_poc.move](finding_2_poc.move)
