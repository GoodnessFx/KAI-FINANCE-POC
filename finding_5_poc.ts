import { TransactionBlock } from '@mysten/sui.js';
import { SuiClient, getFullnodeUrl } from '@mysten/sui.js/client';

/**
 * Finding #5: clock::timestamp_ms() unit mismatch
 * 
 * Vulnerability: Sui returns milliseconds from `clock::timestamp_ms()`.
 * If an interest accrual formula uses `SECONDS_IN_YEAR = 31,536,000` but feeds in
 * raw millisecond values for time delta (dt), the calculation will be 1000x too fast.
 * 
 * Conversely, if the formula expects milliseconds but is fed seconds, it will
 * be 1000x too slow.
 */

async function main() {
    console.log("--- Finding #5: clock::timestamp_ms() unit mismatch (HIGH) ---");
    
    // Scenario:
    // TVL: $9,000,000
    // APR: 10%
    // Expected interest per year: $900,000
    // 
    // If unit mismatch exists (e.g. 1000x too slow):
    // Actual interest accrued: $900
    // Depositor loss: $899,100 per year
    
    console.log("Scenario: TVL $9M, APR 10%");
    console.log("  Expected annual interest: $900,000");
    console.log("  Actual annual interest (if 1000x slower): $900");
    console.log("");
    console.log("Impact: Massive loss of potential yield for SAV depositors.");
}

main();
