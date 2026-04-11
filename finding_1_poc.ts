import { TransactionBlock } from '@mysten/sui.js';
import { SuiClient, getFullnodeUrl } from '@mysten/sui.js/client';

/**
 * Finding #1: Pyth Confidence Interval Ignored
 * 
 * Vulnerability: The protocol ignores the confidence interval returned by Pyth,
 * which is explicitly advised against in Pyth documentation.
 * 
 * "When valuing collateral, use price - conf. When checking margin, use price + conf."
 * 
 * KAI Finance uses the midpoint price (price.price) for both, leading to 
 * collateral overvaluation during periods of high volatility.
 */

async function main() {
    const client = new SuiClient({ url: getFullnodeUrl('mainnet') });

    console.log("--- Finding #1: Pyth Confidence Interval Ignored (CRITICAL) ---");
    
    // Scenario:
    // Midpoint Price (P): $100.00
    // Confidence (C): $5.00 (High volatility scenario)
    // 
    // Conservative Valuation (P - C): $95.00
    // Protocol Valuation: $100.00
    // 
    // A user opens a 10x leverage position with $1000 collateral.
    // Total Assets: $10,000 ($1000 equity + $9000 debt)
    // 
    // Protocol Margin Check:
    // Assets ($10,000) / Debt ($9,000) = 1.111 (SAFE, threshold is 1.10)
    // 
    // Actual (Conservative) Margin:
    // Assets ($9,500) / Debt ($9,000) = 1.055 (UNSAFE, should be liquidated)
    
    console.log("Scenario: Midpoint $100, Confidence $5");
    console.log("  Protocol collateral value: $100.00");
    console.log("  Actual conservative value: $95.00");
    console.log("  Leverage: 10x");
    console.log("");
    console.log("Impact:");
    console.log("  The position is opened while being effectively underwater according to Pyth's safety rules.");
    console.log("  SAV depositors absorb the bad debt risk immediately upon position creation.");
}

main();
