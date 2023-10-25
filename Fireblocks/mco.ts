import "dotenv/config";
import {PeerType, TransactionOperation,} from "fireblocks-sdk";
import {APPROVE_ABI, fireblocks, getFee, MATIC_NETWORK, OTA_USDC_WALLET_ADDRESS} from "../utils";
import {utils} from "ethers";

export const MCO2_RETIRE_ABI = [
  "function offsetCarbon(uint256 _carbonTon, string _transactionInfo, string _onBehalfOf)",
];

const mco2Approve = async () => {
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
      "0xeDAEFCf60e12Bd331c092341D5b3d8901C1c05A8",
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

const mco2Retire = async () => {
  try {
    const approveInterface = new utils.Interface(MCO2_RETIRE_ABI);
    const amount = 0.000001;
    const paddedAmount = utils
        .parseUnits(
            amount.toFixed(6),
            6
        )
        .toString();
    const contractCallData = approveInterface.encodeFunctionData("offsetCarbon", [
        paddedAmount,
        "test",
        "test"
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
          address: "0xeDAEFCf60e12Bd331c092341D5b3d8901C1c05A8"
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


mco2Approve()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
