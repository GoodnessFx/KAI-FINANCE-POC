# KAI Finance Security POC Repository

This repository contains Proof of Concept (POC) exploits and technical analysis for several critical and high-severity vulnerabilities discovered in the **KAI Finance Yield Protocol** on Sui.

## Overview

KAI Finance is a leveraged yield protocol built on the Sui blockchain. Our security research has identified six major vulnerabilities ranging from price oracle manipulation to admin capability theft. This repository provides the necessary tools and scripts to reproduce these findings.

## Table of Findings

| ID | Finding | Severity | Impact |
| --- | --- | --- | --- |
| #1 | [Pyth Confidence Interval Ignored](#finding-1---pyth-confidence-interval-ignored) | **CRITICAL** | Collateral overvaluation & Bad Debt |
| #2 | [Adversarial Pyth VAA Selection](#finding-2---adversarial-pyth-vaa-selection) | **CRITICAL** | Risk-free atomic arbitrage |
| #3 | [AdminCap Theft (Store Ability)](#finding-3---admincap-has-store-ability) | **CRITICAL** | Full Protocol Takeover |
| #4 | [Margin Floor Division Bias](#finding-4---margin-calculation-floor-division-favors-borrower) | **HIGH** | Risk undercounting & Insolvency |
| #5 | [Clock Unit Mismatch (Interest)](#finding-5---clocktimestamp_ms-unit-mismatch) | **HIGH** | 1000x Interest Accrual Error |
| #6 | [Atomic Borrow & Manipulation](#finding-6---ptb-atomic-borrow---price-manipulation) | **HIGH** | Unfair Liquidations |

---

## Detailed Findings

### Finding #1 - Pyth Confidence Interval Ignored

**Vulnerability**: The protocol reads Pyth prices but fails to account for the `conf` (confidence interval). In high-volatility scenarios where the confidence interval is wide, the protocol values collateral at the midpoint price instead of the conservative lower bound.

**Code Reference**: [pyth.move:142](file:///kai/leverage/core/sources/pyth.move#L142-L166)
```move
fun get_price_lo_hi_expo_dec(price_info: &ValidatedPythPriceInfo, t: TypeName): (u64, u64, u64, u64, u64) {
    let price = get_price(price_info, t);
    let conf = price.get_conf();
    let p = i64::get_magnitude_if_positive(&price.get_price());
    // ...
    (p, p - conf, p + conf, expo, dec)
}
```
The protocol ignores the `p - conf` value during actual margin calculations.

**POC**: [finding_1_poc.ts](finding_1_poc.ts)

---

### Finding #2 - Adversarial Pyth VAA Selection

**Vulnerability**: The protocol accepts any Pyth VAA within a 60-second staleness window and has no "hold time" or "min blocks" between opening and closing a position. An attacker can fetch an older VAA with a favorable price from the Hermes API and perform an atomic open+close in a single PTB.

**POC**: [finding_2_poc.ts](finding_2_poc.ts)

---

### Finding #3 - AdminCap has `store` Ability

**Vulnerability**: Several critical administrative capabilities (e.g., `PackageAdmin`, `Entity`) are defined with the `store` ability. This allows them to be transferred via `transfer::public_transfer`, making them susceptible to theft if a reference is ever leaked to external code (like a malicious strategy).

**Code Reference**: [access.move:46](file:///access-management/sources/access.move#L46-L56)
```move
public struct PackageAdmin has key, store { ... }
```

**Exploit**: [finding_3_poc.move](finding_3_poc.move)

---

### Finding #4 - Margin Calculation Floor Division Favors Borrower

**Vulnerability**: Margin level calculations use floor division (truncation) for debt valuation. This systematically undercounts the risk of the position, allowing it to remain open when it should be liquidated.

**Code Reference**: [position_model.move:202](file:///kai/leverage/core/sources/clmm/position_model.move#L202)
```move
let debt_value_x64 = (dx_x64 * p_x64 + dy_x128) >> 64; // Floor division
```

**POC**: [finding_4_poc.ts](finding_4_poc.ts)

---

### Finding #5 - clock::timestamp_ms() Unit Mismatch

**Vulnerability**: Interest accrual constants assume seconds (e.g., `SECONDS_IN_YEAR = 31,536,000`), but the protocol uses `clock::timestamp_ms()`. This leads to interest accruing 1000x slower than expected.

**Code Reference**: [supply_pool.move:61](file:///kai/leverage/core/sources/supply_pool.move#L61)
```move
const SECONDS_IN_YEAR: u128 = 365 * 24 * 60 * 60;
```

**POC**: [finding_5_poc.ts](finding_5_poc.ts)

---

### Finding #6 - PTB Atomic Borrow -> Price Manipulation

**Vulnerability**: Liquidators are not prevented from borrowing from the protocol in the same transaction they use to liquidate a victim. This enables zero-capital price manipulation attacks.

**POC**: [finding_6_poc.ts](finding_6_poc.ts)

## Usage

To run the TypeScript POC analysis scripts:

```bash
npm install
npm run finding1
npm run finding2
# ... etc
```

## Disclaimer

This repository is for educational and bug bounty purposes only. Do not use this code for malicious activities.
