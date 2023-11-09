import {Contract, ethers} from "ethers";
import JasminePoolAbi from './JasminePool.json';
import JasmineEatAbi from './JasmineEat.json';
import JasmineMinterAbi from './JasmineMinter.json';
import "dotenv/config";
import {getFee, getProviderAndSigner, MATIC_NETWORK} from "../../utils";
import {BigNumber} from "@ethersproject/bignumber";

const jltEther = async () => {
    try {
        const {provider, signer} = getProviderAndSigner(
            {
                code: "SWAPD",
                assetType: "POOL",
                offsetId: "123",
                ticker: "JLT",
                projectId: "23"
            }
        );
        const amount = 1;
        const JLT_POOL_CONTRACT = "0x81A5Fbb9A131C104627B055d074c46d21576cF4a";
        const wallet = "0x25a945FA5D4ACb685D65017ae47E2Ce4A12EdF70";
        const JasmineEAT = "0xba3aa8083F8978257aAAFB19Ed698a623197A7C1";
        const JasmineMinter = "0x5e71fa178f3b8ca0fc4736b8a85a1b669c042dde";
        const tokenId = "90691946307099771175677978481818837595817817785781839284505641621887880527872";

        const jltPoolContract = new Contract(JLT_POOL_CONTRACT, JasminePoolAbi, signer);
        //const approvalTx = await jltPoolContract.approve(wallet, amount)
        const withdrawSpecific = await jltPoolContract.withdrawSpecific(wallet, wallet, [tokenId], [amount], [], {
            gasLimit: BigNumber.from("800000")
        });
        const eatContract = new Contract(JasmineEAT, JasmineEatAbi, signer);
        const eatBalance = (await eatContract.balanceOf(wallet, tokenId)).toString();
        //const burnTx = await eatContract.burn(wallet, tokenId, amount);


        // const eatApproval = await eatContract.setApprovalForAll(JasmineMinter,true);
        // const minterContract = new Contract(JasmineMinter, JasmineMinterAbi, signer);
        // const burnTx = await minterContract.burn(tokenId, 1, []);
        console.log(eatBalance);
    } catch (err) {
        console.log(err);
    }
};

jltEther()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
