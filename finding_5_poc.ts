import { TransactionBlock } from '@mysten/sui.js';
import { SuiClient, getFullnodeUrl } from '@mysten/sui.js/client';

async function main() {
    // Scenario based on Finding #5: clock::timestamp_ms() unit mismatch
    // 
    // Scenario:
    // TVL: $9,000,000
    // APR: 10%
    // Expected interest per year: $900,000
    // 
    // If unit mismatch exists (e.g., dt is in seconds but denominator is in ms, or vice versa):
    // 
    // If interest accrues 1000x too slow:
    // Actual interest per year: $900
    // Loss to depositors: $899,100
    // 
    // Impact:
    // - Massive depositor loss.
    // - Borrowers pay effectively 0 interest.
    // - Protocol yield is non-existent.

    console.log("--- Finding #5: clock::timestamp_ms() unit mismatch (HIGH) ---");
    console.log("Scenario: TVL = $9M, APR = 10%");
    console.log("");
    console.log("Expected Interest Accrual (1 Year):");
    console.log("  $9M * 0.10 = $900,000");
    console.log("");
    console.log("Actual Interest Accrual (If 1000x slower):");
    console.log("  $900,000 / 1000 = $900");
    console.log("");
    console.log("Depositor Loss: $899,100 / year");
    console.log("");
    console.log("Impact: Protocol fails to accrue significant interest, leading to depositor flight and loss of funds.");
}

main();
