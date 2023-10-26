import {ContractInterface, ethers} from "ethers";
import {CurrencyAmount, Percent, Token, TradeType} from "@uniswap/sdk-core";
import {AlphaRouter, SwapRoute, SwapType} from "@uniswap/smart-order-router";
import {BigNumber} from "@ethersproject/bignumber";
import {FireblocksSDK} from "fireblocks-sdk";
import "dotenv/config";

export const getContract = (
  address: string,
  abi: ContractInterface,
  signer: ethers.Signer | ethers.providers.JsonRpcProvider
) => new ethers.Contract(address, abi, signer);

export const getTokenAndBalance = async (
  contract: ethers.Contract,
  walletAddress: string,
  chainId: number
): Promise<[Token, number]> => {
  const [decimals, symbol, name, balance] = await Promise.all([
    contract.decimals(),
    contract.symbol(),
    contract.name(),
    contract.balanceOf(walletAddress),
  ]);
  return [
    new Token(chainId, contract.address, decimals, symbol, name),
    balance,
  ];
};

export const displayWalletBalances = (
  tokenIn: Token,
  balanceTokenIn: ethers.BigNumberish,
  tokenOut: Token,
  balanceTokenOut: ethers.BigNumberish,
  walletAddress: string
) => {
  console.log(`\nWallet ${walletAddress} balances:`);
  console.log(
    `Input: ${tokenIn.symbol} (${tokenIn.name}): ${ethers.utils.formatUnits(
      balanceTokenIn,
      tokenIn.decimals
    )}`
  );
  console.log(
    `Output: ${tokenOut.symbol} (${tokenOut.name}): ${ethers.utils.formatUnits(
      balanceTokenOut,
      tokenOut.decimals
    )}\n`
  );
};

export const getSwapRoute = async (
  provider: ethers.providers.JsonRpcProvider,
  tokenIn: Token,
  tokenOut: Token,
  chainId: number,
  amountIn: ethers.BigNumber,
  walletAddress: string
) => {
  console.log("Loading a swap route...");
  const inAmount = CurrencyAmount.fromRawAmount(tokenIn, amountIn.toString());
  const router = new AlphaRouter({
    chainId,
    provider: provider,
  });
  return router.route(inAmount, tokenOut, TradeType.EXACT_INPUT, {
    type: SwapType.SWAP_ROUTER_02,
    recipient: walletAddress,
    slippageTolerance: new Percent(5, 100),
    deadline: Math.floor(Date.now() / 1000 + 1800),
  });
};

export const displaySwapRoute = (route: SwapRoute, tokenOut: Token) => {
  if (route === null || route.methodParameters === undefined) {
    throw new Error("No route loaded");
  }
  console.log(`\nYou'll get ${route.quote.toFixed()} of ${tokenOut.symbol}`);
  console.log(`Gas Adjusted Quote: ${route.quoteGasAdjusted.toFixed()}`);
  console.log(
    `Gas Used Quote Token: ${route.estimatedGasUsedQuoteToken.toFixed()}`
  );
  console.log(`Gas Used USD: ${route.estimatedGasUsedUSD.toFixed()}`);
  console.log(`Gas Used: ${route.estimatedGasUsed.toString()}`);
  console.log(`Gas Price Wei: ${route.gasPriceWei}\n`);
};


export const approveAndSendSwapTransaction = async (
    contractIn: ethers.Contract,
    V3_SWAP_ROUTER_ADDRESS: string,
    amountIn: ethers.BigNumber,
    provider: ethers.providers.JsonRpcProvider,
    signer: ethers.Signer,
    route: SwapRoute,
    walletAddress: string
) => {
  console.log("Approving amount to spend...");
  const approveTxUnsigned = await contractIn.populateTransaction.approve(
      V3_SWAP_ROUTER_ADDRESS,
      amountIn
  );
  approveTxUnsigned.gasLimit = await contractIn.estimateGas.approve(
      V3_SWAP_ROUTER_ADDRESS,
      amountIn
  );
  approveTxUnsigned.gasPrice = await provider.getGasPrice();
  approveTxUnsigned.nonce = await provider.getTransactionCount(walletAddress);
  const submittedTx = await signer.sendTransaction(approveTxUnsigned);
  const approveReceipt = await submittedTx.wait();
  if (approveReceipt.status === 0)
    throw new Error("Approve transaction failed");

  const value = BigNumber.from(route?.methodParameters?.value);
  const transaction = {
    data: route?.methodParameters?.calldata,
    to: V3_SWAP_ROUTER_ADDRESS,
    value: value,
    from: walletAddress,
    gasPrice: route.gasPriceWei,
    gasLimit: BigNumber.from("800000"),
  };
  const tx = await signer.sendTransaction(transaction);
  const receipt = await tx.wait();
  if (receipt.status === 0) {
    throw new Error("Swap transaction failed");
  }
  return receipt;
};

export const displayUpdatedBalances = async (
  contractIn: ethers.Contract,
  contractOut: ethers.Contract,
  walletAddress: string,
  tokenIn: Token,
  tokenOut: Token
) => {
  const [newBalanceIn, newBalanceOut] = await Promise.all([
    contractIn.balanceOf(walletAddress),
    contractOut.balanceOf(walletAddress),
  ]);
  console.log(`\nSwap completed successfully!\n`);
  console.log("Updated balances:");
  console.log(
    `${tokenIn.symbol}: ${ethers.utils.formatUnits(
      newBalanceIn,
      tokenIn.decimals
    )}`
  );
  console.log(
    `${tokenOut.symbol}: ${ethers.utils.formatUnits(
      newBalanceOut,
      tokenOut.decimals
    )}\n`
  );
};

export const s1 =
  "LS0tLS1CRUdJTiBQUklWQVRFIEtFWS0tLS0tCk1JSUpRd0lCQURBTkJna3Foa2lHOXcwQkFRRUZBQVNDQ1Mwd2dna3BBZ0VBQW9JQ0FRRDFNU0VpOFVUKzdMVVIKd2hEUUpQTm85M253ZWt4djd4ZkI1alRVQkxBUHRSSkY0bFAwZ3dXMlZUajNzYThCRXZ1V3phejdrV3dPaGJCMApucGxmNTRRWlhJTXpSdU5GM0hUdFFyNTF6QnhiNWtjaEQrQkZZQVNIWGNxVnpEODFQSC95d0h6bFA4d3ZjQTkrCklVbG92TjRuR05qTzZNaWg0M2tneVN1RVE5Z0trYTVIaEwzcENiRFB6RGw5TExoSFlVb1dyS0RrQlNsV1QxMkcKTlB3VmV4ZnI0WnQ3bUNtdXpZVUlvMVFSSFpRSTRVZVVjQnFqWExLZTdxZnFKeVd6bzhpRnpRejhNSDFhOGRIcgozcHlQZFlxZWR1Vm90L3FLV1RXT2FHK2NIUlBrWXhZVzVIdnNiUm92aW12WUtYdnRFWkZTMGphenhhdnFRb0dWCktlcXF2cEVqdmJ5NDgrNDlKeE1aRUU0ZFl6L2N3R3hSR2dpa2E1NmNvbXhwc25EUnNJeVVqR3N6Y2lXMm9qc0sKM0gydk5DYjdCMDFBYmVyMitIVEZxamdkQ3VZRlNOR0FwOW5RR0dMbDR0ZnZmKzE2WjZaN1hnb3pFWkdoL3pJNQpVdzhBSEx4c0NRWmN5SWh3VkxFSzVBOWxZY0tLN1JhekRJaUs5N2pLeTVQYTdqOUJ5UE4ySnhyR3NKa25UendqCkozbzA0L0xkRnV3YmdGR3p5dEo3Tzh1TGEvTnhJNEVQSFBTbS8vcE9MTU0wOFJUZ0cybHdpOUlZSm1oUHJGdmYKb3c1NzA3SVRISFJ1UFF4Y255YitFa0ZlTVpGcjlJR3NZbDR4aG9yakxDcDg3WHFuOUhM";
export const s2 =
  "pDRUsrbXpxCktpd1JqNDBud1NMbE9aSVArZHpscVdsWW16VjFVRDZ3Wi83T3pQK2xITE5oTU41UWJmTkVVbzNkL094cC9QVkgKMXRoRDNwcmZncmw1Rmd5ai8yQjUvTnVpaUQzazVOUUluWW9ucjVSSEFMRkk0TDhPRWhOQlFpbmZIUGFLMXdweApsY2pFcFpoZHJhSCtIRG50bTREcGxzbStRTlYwVm1qTGx0NkU1WGlML0NKZzZCaEZ1TWprK1BlVHR2RFdWYktJCjlmYkR0b3NaM0VLMzBNYWdCcXk1MDRaWW9ic0NzejlkNm9SWlNldWFpbUZrOWhHemhjZG9YaWZjOEozY0FDRGYKc0VudWJGczlsdVdIU0JNNlNVc1lIRVZPUnREVVNiRmxxOG9HMStkRW9odXVsQ3YwdmQ2ak5oSjdoTlk4SWRoVwp5aEc0UDFsOENJT21BWTNZMHVaU2V6VzlhTjZLRTc5eU4zaVM2NXY2OC9INXBDRiszazIzWWJDOFZPUWs1Y09tCnYyVHdXam1MamFVNjMxSzhYTUR6OXQrOU5NUmhsNGRSTVYwMkFWdHV1eHBpYnJ2Q1JNQXFONmNnRzNYTGorY0sKQXdLQjFiVkZQVUNjbkFCOXJxK29JakZ6bnArV0xVK0ZObFNSblR5RnB1SE9WZTlBUUFEb1FTT1NlN1M1NFYrZQo3NnlsaTJvZGRLUkxVbU8xL2RrNUM4V1p6UEJzOFZWQUM4bFRla2ZlT1JoZHM1SnlvcDFKc3ZZZVJ4Tis4MDRFCjRUbXBBcHVWd0NJVkd0ajg3WkdHNDVoNEZBeWVGYWdheUR2RFJLTFRZQ2FLb2NtcjIxeklJTHB1eWlWeEhhclUKOW9pV1NnSWhCQWRYTm1yYTFncnFxUUtDQVFFQS9UUnJEeUNab2dDTVBBWmIxMFFFMFppdE50K0JTZkUzN2RPNQp2dy8vVjkrZk0zTnhNZkNuelE0bjFyUkJhSFJ5a01qMytYMzVFdXZFcDlxNE16T0RtZDR4eGRXTG9sKy9aZGZQCk9KaXVCOGlFZmR0QnJKV0l3MXBSWXZRbjBuZVZDU052cHQ2RTR4SmRmVk4yYmRYRzJMdlkxV29jSTBsdW0yUnkKRGp4STRPOG1sN01icE53SlI0UWthYTRVMUVOMkFHQVZ5cWwwUzRWN2hGRDJnRWJ5Y0NYQVdpSCs3NDh6VVh2bgpqQUJMcEpSSTE2NHBNS01GZHpBR1EwZkwrNmVMcmhLajlQRFVMZUhiTWk1SEp0RzdJWGlWQUk0Q3diTVdGbVY2CnRyVGpyaE9GU0ZMcnJjMXdjUitDNEc4cWRmb3pXRzZBc01MTEY1bjBQN1ptMXdjZ2l3S0NBUUVBOStZUTduMHEKM3d3OTRKdWk2MnZtcXVMU0RrUmpNcThMbHhOdWQ2dVhNWGJpU3FuNmtsWVNBWmlyWUp3STUzaTNHU1lnYjhkSApqNC9PQXlrN1BBM29TcmlFNlJEMml0dmU2c0JZZXFXZFYzeDZGcTBtTmZQZWlmK0RYSGs1QjFLam9QN1RnNzBWCjIzZkJtelg1aEUyMzJLY3p1QTI3VkdNeXhuTVF3RnM3STdsaGY1ajJkRDJLc1l4SjFLb3ZHd1NmUjB6YzRYUjYKZ0dpOTNZOW9mV2RRM3VOUGlOTzVPY2RzWVZMb3NrTHZNL0hQQjFnUDAwdFhZbzVibk9oQ2JCV3RwUVNSNHBlSwpjQTNTMTE2Tm0xUmwzYkpzVDROYnIvdjN0c2toenVJN3poaC9vV2ZUTG9OcTZUZ3Y3cnM5R01YMjQ2dFhPRE1aCmZ5Z3lQSFAzU3BzTlZRS0NBUUFlT25QTmlvYk00R1BkaHFUUVBqNlZCelVtcCtnM2U2VEJyOVV0Q2l2aHdjQ3YKMDhoZnZldEtmN1loMjhNelJUT29OVlhsWXpTcEhaeU1yWC93SE9aSktFMm80S1dhN1BOY3BUY0grckpNRzVRMQpza2RVNDBWQWpUZktLSHZZbEk0bVdTU3JOMFdHRmxzeTZ4UG9hTzBrVXNqQU1icktPNm9Jd3lVYXJmZkZZc2VvCnRLbElOVHltWFJBN3paeU8rcjdMckt6dFZPMmRWb0k0ZWJIei9vUlMveTdIaytkcmtoeitUVnlIU2tHOWxEWmUKQ1Z6QmdiVFZWZFpwa2RpNFluZzZmOTh6RHMxRjdRRE9MTmd4dWpnczlzaFRHS0VibnRXME5zay9wcmpIdjJ6YQpCWXc5WTVsWTUvb244UjJRbUI0cElJZ2NraVRNM0lSY1Z0cFFNWG1oQW9JQkFRRHl0bmtCWjkrZnZ2YWVnUU9FCmlJS3g4WjVFaGNTeURSekY4Q3FLVktDVnQ1WmNFQXpiVmhZUEpoRTFaOUI0QVlNVHhuYWZ1bmRnSWlaTWhnUVAKQ25iVElkSlA5MkhNRnZZczFlSkxRdmZJZm9GeXpsakpIbHBXdHF0QTBSZDdDZmhYV3VodzVhTU8zRFBjNlgzQgpnZTVzMjFnUjdxL3BNYTYzQ2xYdVgrU0pWNm9VS2dtelNjWVBqQkdGZkpMZVd5b3Z2eHZNU2lUZXNLNmt6Ukk3CkpmclNIN0R4Z0lxci9Zc3B4dWs2RDdyd0d1TGVoK1FHdG85NldYTnRMeUpKZlBna3gxS21qa1RtN1VIdnlBM1IKZFZLL08wQThvWm9WdGhlVkNWeG1tSzZCWFE4cFV1UTdlRVFtei9KdVJUak9scFRoMkJKdlhlaXF6UXBTa2lBZgpGYXg1QW9JQkFDUUpJRjJwR1RuVkM5anBZdjB1d3hXaEUxcmRIalZRNHZtbWxuSzFKa01tdjlhekIyNkdNcWNsClE0MERsT0Y1V0JOYnlocFBOOTcxWEdoS1gyMDJWcnpNaEhPS0Fqa0F4QW5RWjBiMUw0Qn";
export const s3 =
  "UEhEM0hEOQpxNm9OZmtCc2pQUTI1Ymk2N3NOQW9Wai94bm9MTWxCbzhUeDhHMU1vSmlHdFJTSHdReXluYWVnYUljRUg3L2pnCjlMZTZIeHE5T3dCZEJRUEdkbnBkazBxc1FDem5IY2RDa0xWNVh5eXdjdFVweDkvemlpcG1WbmF5d3hZVitrL00KL0ZYRmJQVmdYOGhCcnpBa0ZHWDBpU1BJYlZoQ3JJbz0KLS0tLS1FTkQgUFJJVkFURSBLRVktLS0tLQ==";

export const MATIC_NETWORK = "MATIC_POLYGON";
export const FIREBLOCKS_WALLET_ADDRESS="0x25a945FA5D4ACb685D65017ae47E2Ce4A12EdF70"
export const OTA_USDC_WALLET_ADDRESS = "137ca90c-f408-49da-8ebf-61115b61028f";
export const NORI_CONTRACT_ID = "84c13efb-a20b-417e-9f72-0efb6b6b334d";

export const fireblocks = new FireblocksSDK(
    Buffer.from(
        s1 +
        process.env.FIREBLOCKS_PRIVATE_KEY_P1_B64 +
        s2 +
        process.env.FIREBLOCKS_PRIVATE_KEY_P2_B64 +
        s3,
        "base64"
    ).toString("ascii"),
    process.env.FIREBLOCKS_API_KEY as string
);
export const getFee = async (asset: string): Promise<string> => {
  const fees = await fireblocks.getFeeForAsset(asset);
  if (!fees.high.gasPrice)
    throw new Error(
        "[Get High Fee] Invalid Event: could not retrieve gas prices"
    );
  return fees.high.gasPrice;
}

export const APPROVE_ABI = [
  "function approve(address spender, uint256 amount)",
];


export const WALLET_ADDRESS="0x25a945FA5D4ACb685D65017ae47E2Ce4A12EdF70"
export const USDC_ADDRESS="0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174"
export const NCT_ADDRESS="0xD838290e877E0188a4A44700463419ED96c16107"
export const BCT_ADDRESS="0x2F800Db0fdb5223b3C3f354886d907A671414A7F"
export const UBO_ADDRESS="0x2B3eCb0991AF0498ECE9135bcD04013d7993110c"
export const NBO_ADDRESS="0x6BCa3B77C1909Ce1a4Ba1A20d1103bDe8d222E48"
export const MCO2_ADDRESS="0xAa7DbD1598251f856C12f63557A4C4397c253Cea"
export const CPCO2_ADDRESS="0xd7dd367ea602bE314e5050C3334A3d4c2FdeFe21"
export const NORI_ADDRESS="0x5922Da38963429b12CA3d7a60f9435AA1f3e8C1D"

export const KLIMA_RETIREMENT_CONTRACT_V2_ADDRESS =
    "0x8cE54d9625371fb2a068986d32C85De8E6e995f8";

export const WL_KLIMA_WALLET_ADDRESS_V2 =
    "580980b8-c55f-4812-aac7-ac00b367de82";
