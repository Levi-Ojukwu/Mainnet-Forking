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

    // await DAI.approve(UNIRouter, ethers.parseUnits("100000", 18));

    const amountOutMin = ethers.parseUnits("90", 18);

    const path = [WETHAddress, DAIAddress];

    const daiBalanceBefore = await DAI.balanceOf(impersonatedSigner.address);

    const deadline = Math.floor(Date.now() / 1000) + 60 * 10;

    const ethBalanceBefore = await ethers.provider.getBalance(impersonatedSigner.address);

    console.log("=================Before Swap========================================");

    console.log("DAI Balance before swap:", ethers.formatUnits(daiBalanceBefore, 18));
    console.log("ETH Balance before swap:", ethers.formatEther(ethBalanceBefore));
    
    console.log("Swapping ETH for DAI...");
    const tx = await ROUTER.swapExactETHForTokens(
        amountOutMin,
        path,
        impersonatedSigner.address,
        deadline,
        { value: ethers.parseEther("1") }
    );

    await tx.wait();

    const daiBalanceAfter = await DAI.balanceOf(impersonatedSigner.address);
    
    const ethBalanceAfter = await ethers.provider.getBalance(impersonatedSigner.address);

    console.log("==================After Swap==========================================");

    console.log("DAI Balance after swap:", ethers.formatUnits(daiBalanceAfter, 18));
    console.log("ETH Balance after swap:", ethers.formatEther(ethBalanceAfter));

    console.log("==================Difference==========================================");

    const newDaiBalance = daiBalanceAfter - daiBalanceBefore;
    const newEthBalance = ethBalanceBefore - ethBalanceAfter;
    
    console.log("DAI Balance difference:", ethers.formatUnits(newDaiBalance, 18));
    console.log("ETH Balance difference:", ethers.formatEther(newEthBalance));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});