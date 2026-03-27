//! BlueCollar Market Contract
//! Handles tip/payment escrow between users and workers on Stellar (Soroban).

#![no_std]

use soroban_sdk::{contract, contractimpl, contracttype, token, Address, Env, Symbol};

#[contracttype]
#[derive(Clone)]
pub struct Tip {
    pub from: Address,
    pub to: Address,
    pub amount: i128,
    pub token: Address,
    pub released: bool,
}

#[contracttype]
pub enum DataKey {
    Tip(Symbol),
    Admin,
    FeeBps,
    FeeRecipient,
}

#[contract]
pub struct MarketContract;

#[contractimpl]
impl MarketContract {
    /// Initialise the contract — sets admin, fee basis points, and fee recipient
    pub fn initialize(env: Env, admin: Address, fee_bps: u32, fee_recipient: Address) {
        assert!(
            !env.storage().instance().has(&DataKey::Admin),
            "Already initialized"
        );
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::FeeBps, &fee_bps);
        env.storage().instance().set(&DataKey::FeeRecipient, &fee_recipient);
    }

    /// Return the admin address
    pub fn get_admin(env: Env) -> Address {
        env.storage().instance().get(&DataKey::Admin).expect("Not initialized")
    }

    /// Return the fee in basis points (e.g. 100 = 1%)
    pub fn get_fee_bps(env: Env) -> u32 {
        env.storage().instance().get(&DataKey::FeeBps).expect("Not initialized")
    }

    /// Return the address that receives collected fees
    pub fn get_fee_recipient(env: Env) -> Address {
        env.storage().instance().get(&DataKey::FeeRecipient).expect("Not initialized")
    }

    /// Send a tip to a worker — transfers tokens directly
    pub fn tip(env: Env, from: Address, to: Address, token_addr: Address, amount: i128) {
        from.require_auth();
        let client = token::Client::new(&env, &token_addr);
        client.transfer(&from, &to, &amount);
    }

    /// Upgrade the contract WASM (admin only)
    pub fn upgrade(env: Env, admin: Address, new_wasm_hash: soroban_sdk::BytesN<32>) {
        admin.require_auth();
        env.deployer().update_current_contract_wasm(new_wasm_hash);
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use soroban_sdk::testutils::Address as _;
    use soroban_sdk::Env;

    fn setup() -> (Env, MarketContractClient<'static>, Address, Address) {
        let env = Env::default();
        let contract_id = env.register_contract(None, MarketContract);
        let client = MarketContractClient::new(&env, &contract_id);
        let admin = Address::generate(&env);
        let fee_recipient = Address::generate(&env);
        client.initialize(&admin, &100u32, &fee_recipient);
        (env, client, admin, fee_recipient)
    }

    #[test]
    fn test_get_admin() {
        let (_env, client, admin, _) = setup();
        assert_eq!(client.get_admin(), admin);
    }

    #[test]
    fn test_get_fee_bps() {
        let (_env, client, _, _) = setup();
        assert_eq!(client.get_fee_bps(), 100u32);
    }

    #[test]
    fn test_get_fee_recipient() {
        let (_env, client, _, fee_recipient) = setup();
        assert_eq!(client.get_fee_recipient(), fee_recipient);
    }

    #[test]
    #[should_panic(expected = "Already initialized")]
    fn test_initialize_twice_panics() {
        let (env, client, admin, fee_recipient) = setup();
        client.initialize(&admin, &100u32, &fee_recipient);
    }
}
