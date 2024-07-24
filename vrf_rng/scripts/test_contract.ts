import { Provider, Wallet, WalletUnlocked, hashMessage } from "fuels";
import { VrfLyncAbi__factory } from "../typegen";
import { getRandomB256 } from "fuels";
import {VrfImplAbi__factory} from "../contracts"
const FUEL_RPC_URL = "https://testnet.fuel.network/v1/graphql";

const CONTRACT_ID =
  "0x271fd38866c6aa3bafe5c9ae9306435c57250ab7608771adc45c64beec33abe8";

const vrf_CONTRACT_ID = "0x749a7eefd3494f549a248cdcaaa174c1a19f0c1d7898fa7723b6b2f8ecc4828d"



  const generateSeed = () => {
    const seed = getRandomB256();
    return seed;                   
  }

(async () => {
  //try {
  const provider = await Provider.create(FUEL_RPC_URL);
  const baseAssetId = provider.getBaseAssetId();
  const mnemonic = "_____ your mnemonic here ____";
  const wallet = WalletUnlocked.fromMnemonic(
    mnemonic!,
    undefined,
    undefined,
    provider,
  );

  console.log("Your imported wallet Address: ", wallet.address.toAddress());
  console.log("Your imported wallet Address(b256): ", wallet.address.toB256());


  const contract = VrfLyncAbi__factory.connect(CONTRACT_ID, wallet);

  const Vrf = VrfImplAbi__factory.connect(vrf_CONTRACT_ID, wallet);

  let get_fee = await contract.functions.rng_cost()
  .addContracts([Vrf])
  .get();
  console.log("rng cost fee : ", get_fee.value.toString());

  console.log("....... testing attempt 1 (1st seed) .......")

  const seed1 = generateSeed();

  console.log("seed1 generated: ",seed1.toString());

  const txn_request = await contract.functions.request_random_number(seed1)
  .callParams({
    forward: [get_fee.value.toString(), baseAssetId],
  })
  .addContracts([Vrf])
  .call();
  console.log("Transaction Id(request): ", txn_request.transactionId);



})();
