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
}

#[contract]
pub struct MarketContract;

#[contractimpl]
impl MarketContract {
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
