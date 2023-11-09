import "dotenv/config";
import {Contract, utils} from "ethers";
import {getProviderAndSigner, USDC_ADDRESS} from "../../utils";
import noriAbi from './noriAbi.json';
import usdcAbi from './usdcAbi.json';
import nrtAbi from './nrtAbi.json';
import erc20Abi from './ERC20_abi.json';
import {BigNumber} from "@ethersproject/bignumber";

const noriRetire = async () => {
    try {
        const {provider, signer} = getProviderAndSigner(
            {
                code: "SWAPD",
                assetType: "POOL",
                offsetId: "123",
                ticker: "NORI",
                projectId: "23"
            }
        );
        const NORI_CONTRACT = "0x6d14906698f636AB6fd9209518b0e9DA2d9eeEEF";
        const wallet = "0x25a945FA5D4ACb685D65017ae47E2Ce4A12EdF70";
        const amount = 0.000001;
        const walletContract = new Contract(wallet,erc20Abi,signer);
        const paddedAmount = utils
            .parseUnits(
                amount.toFixed(6),
                6
            )
            .toString();
        const approvalTx = await walletContract.approve(NORI_CONTRACT,paddedAmount);
        const retireAmount = utils.parseUnits(amount.toString(), 18);
        const noriContract = new Contract(NORI_CONTRACT, noriAbi, signer);
        const swapTx = await noriContract['swap(address,uint256)'](wallet, retireAmount,{
            gasLimit: BigNumber.from("800000")
        });
        console.log(swapTx);
    } catch (err) {
        console.log(err);
    }
};


noriRetire()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));