const helpers = require("@nomicfoundation/hardhat-network-helpers");
import { ethers } from "hardhat";

const main = async () => {
    const DAIAddress = "0x6B175474E89094C44Da98b954EedeAC495271d0F";
    const WETHAddress = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
    const UNIRouter = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";
    const TokenHolder = "0x28C6c06298d514Db089934071355E5743bf21d60";

    await helpers.impersonateAccount(TokenHolder);
    const impersonatedSigner = await ethers.getSigner(TokenHolder);

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

    await DAI.approve(UNIRouter, ethers.parseUnits("100000", 18));

   const amountDAI = ethers.parseUnits("100", 18);

   const ethToSend = ethers.parseEther("0.04");
   
   const amountDAIMin = ethers.parseUnits("90", 18);

   const amountWETHMin = ethers.parseUnits("0.03");

   const daiBalanceBefore = await DAI.balanceOf(impersonatedSigner.address);

   const deadline = Math.floor(Date.now() / 1000) + 60 * 10;

   const wethBalanceBefore = await ethers.provider.getBalance(impersonatedSigner.address);

   console.log("=================Before Adding Liquidity========================================");
    console.log("DAI Balance before adding liquidity:", ethers.formatUnits(daiBalanceBefore, 18));
    console.log("WETH Balance before adding liquidity:", ethers.formatEther(wethBalanceBefore));
    
    console.log("Adding liquidity to DAI/WETH pool...");

    const tx = await ROUTER.addLiquidityETH(
        DAIAddress,
        amountDAI,
        amountDAIMin,
        amountWETHMin,
        impersonatedSigner.address,
        deadline,
        { value: ethToSend }
    );
    
    await tx.wait();

    console.log("==================After Adding Liquidity==========================================");

    const daiBalanceAfter = await DAI.balanceOf(impersonatedSigner.address);
    
    const wethBalanceAfter = await ethers.provider.getBalance(impersonatedSigner.address);

    console.log("DAI Balance after adding liquidity:", ethers.formatUnits(daiBalanceAfter, 18));
    console.log("WETH Balance after adding liquidity:", ethers.formatEther(wethBalanceAfter));

    console.log("==================Difference==========================================");

    const newDaiBalance = daiBalanceBefore - daiBalanceAfter;
    const newWethBalance = wethBalanceAfter - wethBalanceBefore;

    console.log("DAI added to liquidity pool:", ethers.formatUnits(newDaiBalance, 18));
    console.log("WETH added to liquidity pool:", ethers.formatEther(-newWethBalance));

    console.log("Liquidity added successfully!");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});