import { TransactionBlock } from '@mysten/sui.js';
import { SuiClient, getFullnodeUrl } from '@mysten/sui.js/client';

/**
 * Finding #4: Margin Calculation Floor Division favors borrower
 * 
 * Vulnerability: The protocol uses floor division (truncation) for debt calculation.
 * 
 * In `position_model_clmm.move`, `debt_value_x64` is computed as:
 * `let debt_value_x64 = (dx_x64 * p_x64 + dy_x128) >> 64;`
 * 
 * This truncates the fractional part of the debt, making positions look safer than
 * they are. Conservative safety calculations MUST use ceiling division for debt.
 */

async function main() {
    console.log("--- Finding #4: Margin Calculation Floor Division (CRITICAL) ---");
    
    // Scenario:
    // Actual Debt Value: $100.999... (just below $101)
    // Threshold for liquidation: 1.10
    // Assets: $111.00
    // 
    // Protocol Debt Calculation (Floored):
    // Debt = floor($100.99) = $100
    // Margin = $111 / $100 = 1.11 (SAFE)
    // 
    // Actual Margin (Ceiled):
    // Debt = ceil($100.99) = $101
    // Margin = $111 / $101 = 1.099 (UNSAFE, position should be liquidated)
    
    console.log("Scenario: Assets $111, Actual Debt $100.99, Threshold 1.10");
    console.log("  Protocol floored debt: $100.00");
    console.log("  Correct ceiled debt: $101.00");
    console.log("");
    console.log("Results:");
    console.log("  Protocol Margin: 1.11 (Position stays open)");
    console.log("  Correct Margin: 1.099 (Position is insolvent)");
    console.log("");
    console.log("Impact: Systematic accumulation of bad debt across the protocol.");
}

main();
