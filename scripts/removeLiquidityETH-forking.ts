/** @format */

const helpers = require("@nomicfoundation/hardhat-network-helpers");
import { ethers } from "hardhat";

const main = async () => {
	const USDCAddress = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
	const WETHUSDCPairAddress = "0xb4e16d0168e52d35cacd2c6185b44281ec28c9dc";
	const UNIRouter = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";
	const tokenHolder = "0x28C6c06298d514Db089934071355E5743bf21d60";

	await helpers.impersonateAccount(tokenHolder);
	const impersonatedSigner = await ethers.getSigner(tokenHolder);

	const amountTokenDesired = ethers.parseUnits("300", 6);
	const amountTokenMin = ethers.parseUnits("1", 6);
	const amountETHMin = ethers.parseEther("0.01");
	const amountETHDesired = ethers.parseEther("0.1");
	const deadline = Math.floor(Date.now() / 1000) + 60 * 10;

	const USDC = await ethers.getContractAt(
		"IERC20",
		USDCAddress,
		impersonatedSigner,
	);

	const LpToken = await ethers.getContractAt(
		"IERC20",
		WETHUSDCPairAddress,
		impersonatedSigner,
	);

	const ROUTER = await ethers.getContractAt(
		"IUniswapV2Router",
		UNIRouter,
		impersonatedSigner,
	);

	await USDC.approve(UNIRouter, amountTokenDesired);
	// await LpToken.approve(UNIRouter, amountTokenDesired);

	const addLiquidityTx = await ROUTER.addLiquidityETH(
		USDCAddress,
		amountTokenDesired,
		amountTokenMin,
		amountETHMin,
		impersonatedSigner.address,
		deadline,
		{ value: amountETHDesired },
	);

	await addLiquidityTx.wait();

	const lpBalanceBefore = await LpToken.balanceOf(impersonatedSigner.address);
	const liquidityToRemove = lpBalanceBefore / BigInt(2);

	const amountTokenMinRemove = ethers.parseUnits("1", 6);
	const amountETHMinRemove = ethers.parseEther("0.001");

	await LpToken.approve(UNIRouter, liquidityToRemove);

	const usdcBalanceBefore = await USDC.balanceOf(impersonatedSigner.address);
	const ethBalanceBefore = await ethers.provider.getBalance(
		impersonatedSigner.address,
	);

	console.log(
		"=================Before Removing Liquidity========================================",
	);

	console.log(
		"USDC Balance before removing liquidity:",
		ethers.formatUnits(usdcBalanceBefore, 6),
	);
	console.log(
		"ETH Balance before removing liquidity:",
		ethers.formatEther(ethBalanceBefore),
	);
	console.log("LP balance before removing liquidity"),
		ethers.formatUnits(lpBalanceBefore, 18);

	const removeLiquidity = await ROUTER.removeLiquidityETH(
		USDCAddress,
		liquidityToRemove,
		amountTokenMinRemove,
		amountETHMinRemove,
		impersonatedSigner.address,
		deadline,
	);
    await removeLiquidity.wait();

    const usdcBalanceAfter = await USDC.balanceOf(impersonatedSigner.address);
    const ethBalanceAfter = await ethers.provider.getBalance(
        impersonatedSigner.address,
    );
    const lpBalanceAfter = await LpToken.balanceOf(impersonatedSigner.address);

    console.log("=====================After removing liquidity=====================");

    console.log(
		"USDC Balance after removing liquidity:",
		ethers.formatUnits(usdcBalanceAfter, 6),
	);
	console.log(
		"ETH Balance after removing liquidity:",
		ethers.formatEther(ethBalanceAfter),
	);
	console.log("LP balance after removing liquidity"),
		ethers.formatUnits(lpBalanceAfter, 18);

    console.log("=====================Difference=====================");
    
    const newUsdcBalance = usdcBalanceAfter - usdcBalanceBefore;
    const newEthBalance = ethBalanceAfter - ethBalanceBefore;
    const newLpBalance = lpBalanceBefore - lpBalanceAfter;

    console.log("Difference in USDC balance", ethers.formatUnits(newUsdcBalance));
    console.log("Difference in WETH balance", ethers.formatEther(newEthBalance));
    console.log("LP burned", ethers.formatUnits(newLpBalance));

    console.log("Liquidity ETH Removed successfully!");
};

main().catch((error) => {
	console.error(error);
	process.exitCode = 1;
});
