const helpers = require("@nomicfoundation/hardhat-network-helpers");
import { ethers } from "hardhat";

const main = async() => {
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

    const amountOut = ethers.parseUnits("1", 18);

    const amountInMax = ethers.parseUnits("3000", 18);
    
    const path = [DAIAddress, WETHAddress];

    const daiBalanceBefore = await DAI.balanceOf(impersonatedSigner.address);

    const deadline = Math.floor(Date.now() / 1000) + 60 * 10;

    const etherBalanceBefore = await ethers.provider.getBalance(impersonatedSigner.address);

    console.log("=================Before Swap========================================");
    console.log("Ether Balance before swap:", ethers.formatEther(etherBalanceBefore));
    console.log("DAI Balance before swap:", ethers.formatUnits(daiBalanceBefore, 18));


    await DAI.approve(UNIRouter, amountInMax);

    console.log("Swapping DAI for ETH...");

    const tx = await ROUTER.swapTokensForExactETH(
        amountOut,
        amountInMax,
        path,
        impersonatedSigner.address,
        deadline,        
    );

    await tx.wait();
    
    const daiBalanceAfter = await DAI.balanceOf(impersonatedSigner.address);
    const etherBalanceAfter = await ethers.provider.getBalance(impersonatedSigner.address);

    console.log("=================After Swap========================================");
    console.log("Ether Balance after swap:", ethers.formatEther(etherBalanceAfter));
    console.log("DAI Balance after swap:", ethers.formatUnits(daiBalanceAfter, 18));

    console.log("===============Difference============================================");
    const newETHBalance = etherBalanceAfter - etherBalanceBefore;
    const newDAIBalance = daiBalanceBefore - daiBalanceAfter;

    console.log("Difference in Ether Balance:", ethers.formatEther(newETHBalance));
    console.log("Difference in DAI Balance:", ethers.formatUnits(newDAIBalance, 18));
    console.log("Swapped DAI for ETH successfully!");

}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});