import { TransactionBlock } from '@mysten/sui.js';
import { SuiClient, getFullnodeUrl } from '@mysten/sui.js/client';

async function main() {
    // Scenario based on Finding #4: Margin calculation floor division favors borrower
    // 
    // Scenario:
    // Asset Value: $1000
    // Debt Value: $900.9 (represented as 900.9 * 2^64 in Q64)
    // 
    // If debt value is floored:
    // $900.9 -> $900
    // Margin (Protocol): $1000 / $900 = 1.111 (SAFE)
    // 
    // If debt value was rounded up (conservative):
    // $900.9 -> $901
    // Margin (Correct): $1000 / $901 = 1.109 (UNSAFE if threshold is 1.11)
    // 
    // Numeric Examples:
    // 1. Threshold: 1.10
    //    Asset: 110, Debt: 100.1
    //    Protocol Debt: 100
    //    Protocol Margin: 110 / 100 = 1.10 (SAFE)
    //    Correct Margin: 110 / 100.1 = 1.098 (UNSAFE)
    // 
    // 2. Threshold: 1.25
    //    Asset: 125, Debt: 100.01
    //    Protocol Debt: 100
    //    Protocol Margin: 125 / 100 = 1.25 (SAFE)
    //    Correct Margin: 125 / 100.01 = 1.249 (UNSAFE)
    // 
    // 3. Threshold: 1.05
    //    Asset: 105, Debt: 100.001
    //    Protocol Debt: 100
    //    Protocol Margin: 105 / 100 = 1.05 (SAFE)
    //    Correct Margin: 105 / 100.001 = 1.049 (UNSAFE)

    console.log("--- Finding #4: Margin calculation floor division (HIGH) ---");
    console.log("Scenario: Asset = $110, Actual Debt = $100.1, Threshold = 1.10");
    console.log("");
    console.log("Protocol Margin (Floored Debt):");
    console.log("  Debt = floor($100.1) = $100");
    console.log("  Margin = $110 / $100 = 1.10 (SAFE)");
    console.log("");
    console.log("Correct Margin (Ceiled Debt):");
    console.log("  Debt = ceil($100.1) = $101");
    console.log("  Margin = $110 / $101 = 1.089 (UNSAFE)");
    console.log("");
    console.log("Impact: Systematic undercounting of risk allows positions to stay open when they should be liquidated.");
}

main();
