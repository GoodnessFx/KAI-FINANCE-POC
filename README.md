# KAI Finance Security Research - POC Repository

This repository contains professional-grade Proof of Concept (POC) exploits and technical analysis for the **KAI Finance Yield Protocol** on Sui. The research covers critical vulnerabilities in oracle integration, margin calculation, and access control.

## Overview

KAI Finance is a leveraged yield protocol built on the Sui blockchain. Our audit has identified 6 significant vulnerabilities that could lead to protocol insolvency, loss of user funds, or full protocol takeover.

## Findings Summary

| ID | Severity | Finding | Impact |
| --- | --- | --- | --- |
| #1 | **CRITICAL** | Pyth Confidence Interval Ignored | Collateral overvaluation & Bad debt |
| #2 | **CRITICAL** | Adversarial Pyth Price Selection | Risk-free atomic arbitrage |
| #3 | **CRITICAL** | AdminCap Store Ability | Full Protocol Takeover |
| #4 | **CRITICAL** | Margin Level Floor Division | Systematic undercounting of risk |
| #5 | **HIGH** | Clock unit mismatch | 1000x Interest Accrual Error |
| #6 | **HIGH** | Atomic Borrow -> Manipulation | Zero-capital unfair liquidations |

---

## Technical Details

### #1 - Pyth Confidence Interval Ignored (CRITICAL)
**Vulnerability**: The protocol ignores the `conf` (confidence interval) provided by Pyth. Pyth documentation states that protocols **must** use `price - conf` for collateral valuation and `price + conf` for margin checks.
**Code**: `kai/leverage/core/sources/pyth.move`
```move
let (price_x, _, _, ex, dx) = get_price_lo_hi_expo_dec(price_info, x); // lo/hi ignored
```
**POC**: [finding_1_poc.ts](finding_1_poc.ts)

### #2 - Adversarial Pyth Price Selection (CRITICAL)
**Vulnerability**: Sui PTBs allow updating Pyth and opening/closing a position in a single atomic transaction. Without a hold time, an attacker can pick any price within the 60s staleness window to guarantee profit.
**Code**: `kai/leverage/core/sources/clmm/position_core.move`
`Position` struct lacks `created_at` timestamp.
**POC**: [finding_2_poc.ts](finding_2_poc.ts)

### #3 - AdminCap Store Ability (CRITICAL)
**Vulnerability**: Critical administrative capabilities have the `store` ability, allowing them to be publicly transferred via `transfer::public_transfer`.
**Code**: `access-management/sources/access.move`
```move
public struct PackageAdmin has key, store { ... }
```
**POC**: [finding_3_poc.move](finding_3_poc.move)

### #4 - Margin Level Floor Division (CRITICAL)
**Vulnerability**: Debt valuation uses floor division, truncating the fractional part of debt and making positions appear safer than they are.
**Code**: `kai/leverage/core/sources/clmm/position_model.move`
```move
let debt_value_x64 = (dx_x64 * p_x64 + dy_x128) >> 64; // Floor division
```
**POC**: [finding_4_poc.ts](finding_4_poc.ts)

### #5 - Clock Unit Mismatch (HIGH)
**Vulnerability**: Potential 1000x error in interest accrual if constants (seconds) and clock (ms) are mismatched.
**POC**: [finding_5_poc.ts](finding_5_poc.ts)

### #6 - Atomic Borrow -> Manipulation (HIGH)
**Vulnerability**: Liquidators can borrow from the protocol in the same transaction they use to liquidate a victim, enabling zero-capital manipulation.
**Code**: `kai/leverage/core/sources/clmm/position_core.move`
`liquidate_col_x` lacks reentrancy/borrow guards.
**POC**: [finding_6_poc.ts](finding_6_poc.ts)

## Usage

Install dependencies:
```bash
npm install
```

Run POC analysis:
```bash
npm run finding1
npm run finding2
# ... etc
```

## Disclaimer

This repository is for educational and bug bounty purposes only.
