const helpers = require("@nomicfoundation/hardhat-network-helpers");
import { ethers } from "hardhat";

const main = async () => {
  const WETHAddress = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
  const USDCAddress = "0x6B175474E89094C44Da98b954EedeAC495271d0F";
  const UNIRouter = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";
  const TokenHolder = "0x742d35Cc6634C0532925a3b844Bc454e4438f44e";

  await helpers.impersonateAccount(TokenHolder);
  const impersonatedSigner = await ethers.getSigner(TokenHolder);

  const USDC = await ethers.getContractAt(
    "IERC20",
    USDCAddress,
    impersonatedSigner,
  );

  const ROUTER = await ethers.getContractAt(
    "IUniswapV2Router",
    UNIRouter,
    impersonatedSigner,
  );

  const amountOut = ethers.parseUnits("100", 6); // USDC has 6 decimals

  const path = [WETHAddress, USDCAddress];

  const deadline = Math.floor(Date.now() / 1000) + 60 * 10;

  const usdcBalanceBefore = await USDC.balanceOf(impersonatedSigner.address);

  const wrappedEthBalanceBefore = await ethers.provider.getBalance(impersonatedSigner.address);

  console.log("=================Before Swap========================================");
  console.log("WETH Balance before swap:", ethers.formatEther(wrappedEthBalanceBefore));
  console.log("USDC Balance before swap:", ethers.formatUnits(usdcBalanceBefore, 6));

  console.log("Swapping ETH for USDC...");

  console.log("==================After Swap==========================================");

  const tx = await ROUTER.swapETHForExactTokens(
    amountOut,
    path,
    impersonatedSigner.address,
    deadline,
    { value: ethers.parseEther("10") }
  );

  await tx.wait();

  const usdcBalanceAfter = await USDC.balanceOf(impersonatedSigner.address);

  const wrappedEthBalanceAfter = await ethers.provider.getBalance(impersonatedSigner.address);

  console.log("USDC Balance after swap:", ethers.formatUnits(usdcBalanceAfter, 6));
  console.log("WETH Balance after swap:", ethers.formatEther(wrappedEthBalanceAfter));

}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});