import {PeerType, TransactionOperation,} from "fireblocks-sdk";
import {APPROVE_ABI, CPCO2_ADDRESS, fireblocks, getFee, MATIC_NETWORK, OTA_USDC_WALLET_ADDRESS} from "../utils";
import {utils} from "ethers";
import "dotenv/config";

const CPCO2_CONTRACT = "0xb74bF92EDC6921228D36225E165fE0cb1FE7f882";
const CPCO2_RETIRE_ABI = [
  "function retire(uint256 tokenId, uint256 amount)",
];

const cpcoApprove = async () => {
  try {
    const approveInterface = new utils.Interface(APPROVE_ABI);
    const amount = 0.000001;
    const paddedAmount = utils
        .parseUnits(
            amount.toFixed(6),
            6
        )
        .toString();
    const contractCallData = approveInterface.encodeFunctionData("approve", [
      CPCO2_CONTRACT,
      paddedAmount,
    ]);
    const gasPrice = await getFee(MATIC_NETWORK);
    console.log("Calling transaction.... ",gasPrice);
    const trans = await fireblocks.createTransaction({
      operation: TransactionOperation.CONTRACT_CALL,
      assetId: MATIC_NETWORK,
      source: {
        type: PeerType.VAULT_ACCOUNT,
        id: "0",
      },
      destination: {
        type: PeerType.EXTERNAL_WALLET,
        id: OTA_USDC_WALLET_ADDRESS
      },
      gasPrice,
      amount: "0",
      treatAsGrossAmount: false,
      extraParameters: {
        contractCallData,
      },
    });
    console.log("trans: ", trans);
  } catch (err) {
    console.log(err);
  }
};

const cpcoRetire = async () => {
  try {
    const approveInterface = new utils.Interface(CPCO2_RETIRE_ABI);
    const amount = 0.000001;
    const paddedAmount = utils
        .parseUnits(
            amount.toFixed(6),
            6
        )
        .toString();
    const contractCallData = approveInterface.encodeFunctionData("retire", [
        CPCO2_ADDRESS,
        paddedAmount
    ]);
    const gasPrice = await getFee(MATIC_NETWORK);
    console.log("Calling transaction... ",gasPrice);
    const trans = await fireblocks.createTransaction({
      operation: TransactionOperation.CONTRACT_CALL,
      assetId: MATIC_NETWORK,
      source: {
        type: PeerType.VAULT_ACCOUNT,
        id: "0",
      },
      destination: {
        type: PeerType.ONE_TIME_ADDRESS,
        oneTimeAddress: {
          address: CPCO2_CONTRACT
        }
      },
      gasPrice,
      amount: "0",
      treatAsGrossAmount: false,
      extraParameters: {
        contractCallData,
      },
    });
    console.log("trans: ", trans);
  } catch (err) {
    console.log(err);
  }
};


cpcoRetire()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
