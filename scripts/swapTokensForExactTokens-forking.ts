const helpers = require("@nomicfoundation/hardhat-network-helpers");
import { ethers } from "hardhat";

const main = async () => {
    const USDCAddress = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
    const DAIAddress = "0x6B175474E89094C44Da98b954EedeAC495271d0F";
    const UNIRouter = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";
    const TokenHolder = "0xd64fbcded9a20a301899ae810c3de942bb943996";

    await helpers.impersonateAccount(TokenHolder);
    const impersonatedSigner = await ethers.getSigner(TokenHolder);

    const USDC = await ethers.getContractAt(
        "IERC20",
        USDCAddress,
        impersonatedSigner,
    );

    const DAI = await ethers.getContractAt(
        "IERC20",
        DAIAddress,
        impersonatedSigner,
    );

    const ROUTER = await ethers.getContractAt(
        "IUniswapV2Router",
        UNIRouter,
        impersonatedSigner,
    );

    const amountOut = ethers.parseUnits("1000", 18);

    const amountInMax = ethers.parseUnits("1100", 6);

    const path = [USDCAddress, DAIAddress];

    const DAIBalanceBefore = await DAI.balanceOf(impersonatedSigner.address);

    const deadline = Math.floor(Date.now() / 1000) + 60 * 10;

    const usdcBalanceBefore = await USDC.balanceOf(impersonatedSigner.address);
    
    await USDC.approve(UNIRouter, amountInMax);

    console.log("=================Before Swap========================================");
    console.log("USDC Balance before swap:", ethers.formatUnits(usdcBalanceBefore, 6));
    console.log("DAI Balance before swap:", ethers.formatUnits(DAIBalanceBefore, 18));

    console.log("Swapping USDC for DAI...");

    const tx = await ROUTER.swapTokensForExactTokens(
        amountOut,
        amountInMax,
        path,
        impersonatedSigner.address,
        deadline,
        { gasLimit: 500000 },
        
    );

    await tx.wait();

    console.log("Transaction hash:", tx.hash);

    const DAIBalanceAfter = await DAI.balanceOf(impersonatedSigner.address);
    const usdcBalanceAfter = await USDC.balanceOf(impersonatedSigner.address);

    console.log("==================After Swap==========================================");
    console.log("USDC Balance after swap:", ethers.formatUnits(usdcBalanceAfter, 6));
    console.log("DAI Balance after swap:", ethers.formatUnits(DAIBalanceAfter, 18));

    console.log("==================Difference==========================================");
    const newUsdcValue = usdcBalanceBefore - usdcBalanceAfter;
    const newDaiValue = DAIBalanceAfter - DAIBalanceBefore;

    console.log("New USDC Value:", ethers.formatUnits(newUsdcValue, 6));
    console.log("New DAI Value:", ethers.formatUnits(newDaiValue, 18));

    console.log("Swap executed successfully!");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});