import {Wallet} from '../wallet';
import {Contract} from 'web3-eth-contract';
import {Raptor} from './raptor';
import {RaptorStatistics} from './statistics'

export class RaptorFarm {

	private static readonly address: string = "0x1Ea708bF4De1d4CF94689d32D3a88a2aCAaB2CF9";
	private static readonly raptorbnblp: string = "0xb10B52b7749632DBc0F55Dccb76C09Cd85326790";

	private readonly _wallet: Wallet;
	private readonly _contract: Contract;
	private readonly _raptor: Raptor;
	private readonly _stats: RaptorStatistics;
	private readonly _lpToken: Contract;

	private _lpbalance: number = 0;
	private _stakedlp: number = 0;
	private _rewards: number = 0;
	private _apr: number = 0;

	private _lpbalances: Object = {};
	private _lpstaked: Object = {};

	constructor(wallet: Wallet) {
		if (!wallet.isConnected) {
			throw 'Wallet must be connected before this action can be executed.';
		}

		this._wallet = wallet;
		this._contract = wallet.connectToContract(RaptorFarm.address, require('./raptorfarm.abi.json'));
		this._lpToken = wallet.connectToContract(RaptorFarm.raptorbnblp, require("./erc20.abi.json"));
		this._raptor = new Raptor(wallet);
		this._stats = new RaptorStatistics();
	}

	get wallet(): Wallet {
		return this._wallet;
	}
	get raptor(): Raptor {
		return this._raptor;
	}
	
	get lpbalance(): number {
		return this._lpbalance;
	}
	
	get rewards(): number {
		return this._rewards;
	}
	
	get stakedlp(): number {
		return this._stakedlp;
	}

	get apr(): number {
		return this._apr;	
	}
	
	
	async refresh(): Promise<void> {
		await this._raptor.refresh();
		const dec = 10**18;
		
		var poolLenght = (await this._contract.methods.poolLenght().call());  
		
		for (var _i = 0; _i < poolLenght; _i++) {
			var _totalLp = (await this._lpToken.methods.totalSupply().call());
			var raptorPerLPToken = (await this._raptor.contract.methods.balanceOf(RaptorFarm.raptorbnblp).call())/_totalLp;
			var stakedRaptorInLPs = (await this._lpToken.methods.balanceOf(RaptorFarm.address).call()) * raptorPerLPToken;
			var raptorperyear = ((await this._contract.methods.raptorPerBlock().call())*10512000) * ((await this._contract.methods.poolInfo(0).call()).allocPoint / (await this._contract.methods.totalAllocPoint().call()))
			var _lpToken = wallet.connectToContract((await this._contract.methods.poolInfo(_i).call()).lpToken,require("./erc20.abi.json"));
			var _totalLp = (await _lpToken.methods.totalSupply().call());
			var raptorPerLPToken = (await this._raptor.contract.methods.balanceOf(RaptorFarm.raptorbnblp).call())/_totalLp;
			var stakedRaptorInLPs = (await _lpToken.methods.balanceOf(RaptorFarm.address).call()) * raptorPerLPToken;
			var raptorperyear = ((await this._contract.methods.raptorPerBlock().call())*10512000) * ((await this._contract.methods.poolInfo(_i).call()).allocPoint / (await this._contract.methods.totalAllocPoint().call()))
			this._apr = ((raptorperyear/stakedRaptorInLPs)*50); // *50 for balancing that pooled bnb isn't counted (50/50 pool)
		}
		
		
		this._rewards = (await this._contract.methods.pendingCake(0, this._wallet.currentAddress).call()) / 10**9;
		this._lpbalance = (await this._lpToken.methods.balanceOf(this._wallet.currentAddress).call()) / 10**18;
		this._stakedlp = (await this._contract.methods.userInfo(0, this._wallet.currentAddress).call()).amount / 10**18;
	}
	
	async deposit(pid: number, amount: number): Promise<void> {
		await this._raptor.refresh();
		const rawAmount: number = amount * 10 ** 18;

		

		if (this._raptor.balance * 10 ** 18 >= rawAmount) {
			const allowance = (await this._lpToken.methods.allowance(this._wallet.currentAddress, RaptorFarm.address).call());

			if (allowance < rawAmount) {
				// we need to give allowance to farming contract first
				const allowance = `${BigInt(2**256) - BigInt(1)}`;
				await this._lpToken.methods.approve(RaptorFarm.address, allowance).send({'from': this._wallet.currentAddress});
			}
			await this._contract.methods.deposit(0, rawAmount).send({'from': this._wallet.currentAddress}).send({'from': this._wallet.currentAddress});
		}
		else {
			throw 'Your LP balance is not sufficient';
		}
	}
	
	async withdraw(pid: number, amount: number): Promise<void> {
		await this._raptor.refresh()
		const rawAmount: number = amount * 10 ** 18;		
		
		const 
		
		if ((await this._contract.methods.userInfo(0, this._wallet.currentAddress).call()).amount >= rawAmount) {
		
			const rawAmount: number = amount * 10 ** 18;
			await this._contract.methods.withdraw(pid, rawAmount).send({'from': this._wallet.currentAddress});
		}
		else {
			throw 'Your staked LP balance is not sufficient';
		}
	}
	
	async claim(pid: number): Promise<void> {
		await this._raptor.refresh();
		await this._contract.methods.deposit(pid, 0).send({'from': this._wallet.currentAddress});
	}
	
}