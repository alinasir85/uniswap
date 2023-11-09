import "dotenv/config";
import {getProviderAndSigner} from "../../utils";
import MossAbi from './MossAbi.json';
import Mco2Abi from './Mco2Abi.json';
import {Contract, utils} from "ethers";
import {BigNumber} from "@ethersproject/bignumber";

const mco2Retire = async () => {
  try {
    const {provider, signer} = getProviderAndSigner(
        {
          code: "SWAPD",
          assetType: "POOL",
          offsetId: "123",
          ticker: "MCO2",
          projectId: "23"
        }
    );
    const amount = utils.parseEther("0.002");
    const wallet = "0x25a945FA5D4ACb685D65017ae47E2Ce4A12EdF70";
    const MOSS_CONTRACT = "0xeDAEFCf60e12Bd331c092341D5b3d8901C1c05A8";
    const MCO2_CONTRACT = "0xAa7DbD1598251f856C12f63557A4C4397c253Cea";

    const mco2Contract = new Contract(MCO2_CONTRACT, Mco2Abi, signer);
    await mco2Contract.approve(MOSS_CONTRACT,amount);

    const mossContract = new Contract(MOSS_CONTRACT, MossAbi, signer);

    const offsetTx =  await mossContract.offsetCarbon(amount,wallet,wallet, {
      gasLimit: BigNumber.from("800000")
    });
    console.log(offsetTx);
  } catch (err) {
    console.log(err);
  }
};


mco2Retire()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
