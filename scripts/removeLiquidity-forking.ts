const helpers = require("@nomicfoundation/hardhat-network-helpers");
import { ethers } from "hardhat";

const main = async () => {
    const DAIAddress = "0x6B175474E89094C44Da98b954EedeAC495271d0F";
    const USDCAddress = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
    const DAIUSDCPairAddress = "0xAE461cA67B15dc8dc81CE7615e0320dA1A9aB8D5";
    const UNIRouter = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";
    const tokenHolder = "0x28C6c06298d514Db089934071355E5743bf21d60";

    await helpers.impersonateAccount(tokenHolder);
    const impersonatedSigner = await ethers.getSigner(tokenHolder);

    const amountUSDC = ethers.parseUnits("10000", 6);
    const amountDAI = ethers.parseUnits("10000", 18);
    const amountUSDCMin = ethers.parseUnits("9000", 6);
    const amountDAIMin = ethers.parseUnits("9000", 18);
    const deadline = Math.floor(Date.now() / 1000) + 60 * 10;

    const DAI = await ethers.getContractAt(
        "IERC20",
        DAIAddress,
        impersonatedSigner,
    )

    const USDC = await ethers.getContractAt(
        "IERC20",
        USDCAddress,
        impersonatedSigner,
    )

    const LpToken = await ethers.getContractAt(
        "IERC20",
        DAIUSDCPairAddress,
        impersonatedSigner,
    )

    const ROUTER = await ethers.getContractAt(
        "IUniswapV2Router",
        UNIRouter,
        impersonatedSigner,
    )

    await USDC.approve(UNIRouter, amountUSDC);
    await DAI.approve(UNIRouter, amountDAI);
    // await LPPairAddress.approve(UNIRouter, ethers.parseUnits(UNIRouter, amountUSDC));

    const addLiquidityTx = await ROUTER.addLiquidity(
        DAIAddress,
        USDCAddress,
        amountDAI,
        amountUSDC,
        amountDAIMin,
        amountUSDCMin,
        impersonatedSigner.address,
        deadline,
    );

    await addLiquidityTx.wait();

    console.log("Liquidity added successfully!");

    const lpBalanceBefore = await LpToken.balanceOf(impersonatedSigner.address);
    const liquidityToRemove = lpBalanceBefore / BigInt(2);

    const amountDAIMinRemove = ethers.parseUnits("1", 18);
    const amountUSDCMinRemove = ethers.parseUnits("1", 6);

    await LpToken.approve(UNIRouter, liquidityToRemove);

    const usdcBalanceBefore = await USDC.balanceOf(impersonatedSigner.address);
    const daiBalanceBefore = await DAI.balanceOf(impersonatedSigner.address);

    console.log("==================Before Remove============================");
    console.log("USDC Balance before removing liquidity:", ethers.formatUnits(usdcBalanceBefore, 6));
    console.log("DAI Balance before removing liquidity:", ethers.formatUnits(daiBalanceBefore, 18));
    console.log("LP Balance before removing liquidity:", ethers.formatUnits(lpBalanceBefore, 18));
    
    const removeLiquidityTx = await ROUTER.removeLiquidity(
        DAIAddress,
        USDCAddress,
        liquidityToRemove,
        amountDAIMinRemove,
        amountUSDCMinRemove,
        impersonatedSigner.address,
        deadline,
    );

    await removeLiquidityTx.wait();
    
    const usdcBalanceAfter = await USDC.balanceOf(impersonatedSigner.address);
    const daiBalanceAfter = await DAI.balanceOf(impersonatedSigner.address);
 
    console.log("==================After Remove============================");
    console.log("USDC Balance after removing liquidity:", ethers.formatUnits(usdcBalanceAfter, 6));
    console.log("DAI Balance after removing liquidity:", ethers.formatUnits(daiBalanceAfter, 18));
    console.log("LP Balance after removing liquidity:", ethers.formatUnits(liquidityToRemove, 18));

    console.log("==================Difference============================");
    const usdcRemoved = usdcBalanceAfter - usdcBalanceBefore;
    const daiRemoved = daiBalanceAfter - daiBalanceBefore;
    
    console.log("USDC removed:", ethers.formatUnits(usdcRemoved, 6));
    console.log("DAI removed:", ethers.formatUnits(daiRemoved, 18));
    console.log("Liquidity removed successfully!");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});