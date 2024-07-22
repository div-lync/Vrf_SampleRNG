import { Provider, Wallet, WalletUnlocked, hashMessage } from "fuels";
import { VrfLyncAbi__factory } from "../typegen";
import dotenv from "dotenv";
import { getRandomB256 } from "fuels";
dotenv.config();

const FUEL_RPC_URL = "https://testnet.fuel.network/v1/graphql";
const CONTRACT_ID =
  "0x271fd38866c6aa3bafe5c9ae9306435c57250ab7608771adc45c64beec33abe8";

  const generateSeed = () => {
    const seed = getRandomB256();
    return seed;                   
  }

(async () => {
  //try {
  const provider = await Provider.create(FUEL_RPC_URL);
  const baseAssetId = provider.getBaseAssetId();
  const mnemonic = process.env.MNEMONIC;
  const wallet = WalletUnlocked.fromMnemonic(
    mnemonic!,
    undefined,
    undefined,
    provider,
  );

  console.log("Your imported wallet Address: ", wallet.address.toAddress());
  console.log("Your imported wallet Address(b256): ", wallet.address.toB256());


  const contract = VrfLyncAbi__factory.connect(CONTRACT_ID, wallet);

  let get_fee = await contract.functions.rng_cost().get();
  console.log("rng cost fee : ", get_fee.value.toString());

  console.log("....... testing attempt 1 (1st seed) .......")

  const seed1 = generateSeed();

  console.log("seed1 generated: ",seed1.toString());

  const txn_request = await contract.functions.request_random_number(seed1).callParams({
    forward: [get_fee.value.toString(), baseAssetId],
  }).call();
  console.log("Transaction Id(request): ", txn_request.transactionId);

  const random_number = await contract.functions.get_random_number(seed1).get();
  console.log("random number (seed1): ", random_number);


  console.log("....... testing attempt 2 (2nd seed) .......")

  const seed2 = generateSeed();

  console.log("seed2 generated: ",seed2.toString());

  const txn_request_2 = await contract.functions.request_random_number(seed2).callParams({
    forward: [get_fee.value.toString(), baseAssetId],
  }).call();
  console.log("Transaction Id(request): ", txn_request_2.transactionId);

  const random_number_2 = await contract.functions.get_random_number(seed2).get();
  console.log("random number (seed 2): ", random_number_2);



  console.log("....... testing attempt 3 (1st seed) .......")


  console.log("seed1 generated: ",seed1.toString());

  // const txn_request_3 = await contract.functions.request_random_number(seed1.toString()).callParams({
  //   forward: [get_fee.value.toString(), baseAssetId],
  // }).call();
  // console.log("Transaction Id(request): ", txn_request_3.transactionId);

  const random_number_3 = await contract.functions.get_random_number(seed1).get();
  console.log("random number (seed 1): ", random_number_3);


})();
