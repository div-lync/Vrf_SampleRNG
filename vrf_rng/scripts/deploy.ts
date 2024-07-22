import { Provider, WalletUnlocked } from "fuels";
import { VrfLyncAbi__factory } from "../typegen";
import bytecode from "../typegen/VrfLyncAbi.hex";


const FUEL_RPC_URL = "https://testnet.fuel.network/v1/graphql";

(async () => {
  try {
    const provider = await Provider.create(FUEL_RPC_URL);
    const mnemonic = "_____ your mnemonic here ____";
    const wallet = WalletUnlocked.fromMnemonic(
      mnemonic!,
      undefined,
      undefined,
      provider,
    );

    console.log("Your imported wallet Address: ", wallet.address.toAddress());
    console.log(
      "Your imported wallet Address(b256): ",
      wallet.address.toB256(),
    );
    console.log("---------------------------------------------------------");

    console.log("\nDeploying contract...");
    // deploy the contract
    const contract = await VrfLyncAbi__factory.deployContract(bytecode, wallet);
    console.log("Deployed contract Id: ", contract.id.toAddress());
    console.log("Deployed contract Id(b256): ", contract.id.toB256());

    console.log("---------------------------------------------------------");
  
  } catch (e) {
    console.error("Error: ", e);
  }
})();
