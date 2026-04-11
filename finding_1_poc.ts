// POC for Rate Limiter Bypass via Leverage

// Vulnerability: The rate limiter only counts the principal collateral, not the total position value.
// Code Reference: `create_position_ticket` in `position_core.move`
// 
// move
// let x_value = get_balance_ema_usd_value_6_decimals(&principal_x, ...);
// let y_value = get_balance_ema_usd_value_6_decimals(&principal_y, ...);
// limiter.consume_inflow(x_value + y_value, clock);
// 

console.log("KAI Finance - Rate Limiter Bypass POC");
console.log("-----------------------------------------");

const LEVERAGE = 11;
const RATE_LIMIT_WINDOW = 1_000_000; // $1M rate limit
const ATTACKER_PRINCIPAL = 1_000_000; // $1M principal

console.log(`1. Vault rate limit set to $${RATE_LIMIT_WINDOW.toLocaleString()}`);

// Attacker opens a position using $1M principal at 11x leverage
const borrowedAmount = ATTACKER_PRINCIPAL * (LEVERAGE - 1);
const totalExposure = ATTACKER_PRINCIPAL + borrowedAmount;

console.log(`2. Attacker deposits $${ATTACKER_PRINCIPAL.toLocaleString()} principal at ${LEVERAGE}x leverage.`);

// Protocol calculates inflow for rate limiter
const rateLimiterRecordedInflow = ATTACKER_PRINCIPAL;

console.log(`3. Protocol records $${rateLimiterRecordedInflow.toLocaleString()} inflow to rate limiter.`);

if (rateLimiterRecordedInflow <= RATE_LIMIT_WINDOW) {
    console.log("4. ✅ Transaction passes rate limit check!");
} else {
    console.log("4. ❌ Transaction fails rate limit check.");
}

console.log(`5. Actual exposure added to the protocol: $${totalExposure.toLocaleString()}`);
console.log(`6. The rate limiter protection is ${LEVERAGE}x weaker than intended, as it ignores the $${borrowedAmount.toLocaleString()} borrowed from the SAV.`);
