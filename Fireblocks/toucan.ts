import ToucanClient from "toucan-sdk";
import {BCT_ADDRESS, fireblocks, getProviderAndSigner, WALLET_ADDRESS} from "../utils";
import {ethers} from "ethers";
import {BigNumber} from "@ethersproject/bignumber";
import {IToucanCarbonOffsets} from "toucan-sdk/src/typechain";

export const retireWithToucan = async () => {
    try {
        const { provider, signer } = getProviderAndSigner(
            {
                code:"swap",
                assetType: "pool",
                offsetId: "123",
                ticker:"BCT",
                projectId:"23"
            }
        );
        const toucan = new ToucanClient("polygon", provider, signer);
        const poolSymbol = "BCT";
        let amount = ethers.utils.parseEther(0.01.toString());
        console.log(BigNumber.from("26636421420248980000").toString());
        //await toucan.redeemMany(poolSymbol, ["0x0bccab36f518f55e00f3efe2e828ae63cd2ac1b9"], [amount]);

        //await toucan.depositTCO2(poolSymbol, BigNumber.from("81330032408761868081"), "0xb139C4cC9D20A3618E9a2268D73Eff18C496B991")
        // const contract: IToucanCarbonOffsets = await toucan.getTCO2Contract("0xb139C4cC9D20A3618E9a2268D73Eff18C496B991");
        // let balance = await contract.balanceOf(WALLET_ADDRESS)
        // console.log(balance.toString())
        // await contract.transfer(BCT_ADDRESS, amount);
        // balance = await contract.balanceOf(WALLET_ADDRESS)


       // const resp = await toucan.retire(amount, "0x0bccab36f518f55e00f3efe2e828ae63cd2ac1b9");

    } catch (err) {
        console.error(err);
    }
};

const buildNote = (props: any) => {
    const parts = ['Platform:API', `Code:${props.code}`, `OffsetId:${props.offsetId}`];
    if (props.assetType) {
        parts.push(`AssetType:${props.assetType}`);
    }
    if (props.amountOut) {
        parts.push(`Amount:${props.amountOut}`);
    }
    if (props.tco2Address) {
        parts.push(`tco2Address:${props.tco2Address}`);
    }
    if (props.ticker) {
        parts.push(`Ticker:${props.ticker}`);
    }
    return parts.join(':::');
}


export const getValueByName = (array: string[], name: string): string | undefined => {
    for (const item of array) {
        const parts = item.split(':');
        if (parts.length === 2 && parts[0] === name) {
            return parts[1];
        }
    }
    return undefined;
};



retireWithToucan().then(_r => _r);