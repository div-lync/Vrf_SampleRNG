contract;

mod error;

use std::{
    auth::msg_sender,
    b512::B512,
    call_frames::msg_asset_id,
    constants::ZERO_B256,
    context::msg_amount,
    revert::revert,
    storage::*,
};
use error::Error;
use vrf_abi::{randomness::{Fulfilled, Randomness, RandomnessState}, Vrf};
use std::hash::Hash;

const VRF_ID = 0x749a7eefd3494f549a248cdcaaa174c1a19f0c1d7898fa7723b6b2f8ecc4828d;

abi RandomNumberGenerator {
    #[payable]
    fn request_random_number(seed: b256);

    #[storage(read, write)]
    fn get_random_number(seed: b256) -> Option<B512>;

    fn rng_cost() -> u64;
}

storage {
    random_number: StorageMap<b256, B512> = StorageMap {},
}

impl RandomNumberGenerator for Contract {
    #[payable]
    fn request_random_number(seed: b256) {
        //let sender = msg_sender().unwrap();
        let amount = msg_amount();
        let msg_asset = msg_asset_id();

        require(msg_asset == AssetId::base(),"invalid-asset");

        let vrf = abi(Vrf, VRF_ID);
        let fee = vrf.get_fee(AssetId::base());

        require(fee == amount,"invalid-fee");

        let _ = vrf.request {
            gas: 1_000_000,
            asset_id: AssetId::base().bits(),
            coins: fee,
        }(seed);
    }

    #[storage(read, write)]
    fn get_random_number(seed: b256) -> Option<B512> {
        let vrf = abi(Vrf, VRF_ID);
        match vrf.get_request_by_seed(seed) {
            Some(r) => match r.state {
                RandomnessState::Fulfilled(x) => {
                    storage.random_number.insert(seed, x.randomness);
                    Some(x.randomness)
                },
                RandomnessState::Unfulfilled(_) => {
                    None
                },
            },
            None => {
                None
            },
        }
    }

    fn rng_cost() -> u64 {
        abi(Vrf, VRF_ID).get_fee(AssetId::base())
    }
}
