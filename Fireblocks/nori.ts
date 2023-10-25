import {PeerType, TransactionOperation} from "fireblocks-sdk";
import {
    APPROVE_ABI,
    fireblocks,
    FIREBLOCKS_WALLET_ADDRESS,
    getFee,
    MATIC_NETWORK,
    NORI_CONTRACT_ID,
    OTA_USDC_WALLET_ADDRESS
} from "../utils";
import {utils} from "ethers";
import "dotenv/config";

export const NORI_SWAP_ABI = [
    "function swap(address recipient, uint256 amount)",
];

const noriApprove = async () => {
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
            "0x6d14906698f636AB6fd9209518b0e9DA2d9eeEEF",
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

const noriRetire = async () => {
    try {
        const approveInterface = new utils.Interface(NORI_SWAP_ABI);
        const amount = 0.000001;
        const paddedAmount = utils
            .parseUnits(
                amount.toFixed(6),
                6
            )
            .toString();
        const contractCallData = approveInterface.encodeFunctionData("swap", [
            FIREBLOCKS_WALLET_ADDRESS,
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
                id: NORI_CONTRACT_ID
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



noriRetire()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));