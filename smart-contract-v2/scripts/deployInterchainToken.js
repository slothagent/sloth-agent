const ethers = require('ethers');
const { deployUpgradable } = require('@axelar-network/axelar-gmp-sdk-solidity');
const { AxelarAssetTransfer, AxelarQueryAPI, CHAINS, Environment } = require('@axelar-network/axelarjs-sdk');

const ERC20CrossChainProxy = require('../abi/ERC20CrossChainProxy/ERC20CrossChainProxy.json');
const ERC20CrossChain = require('../abi/ERC20CrossChain/ERC20CrossChain.json');

const name = 'An Awesome Axelar Cross Chain Token';
const symbol = 'AACCT';
const decimals = 18;

async function deploy(chain, wallet, key) {
    console.log(`Deploying ERC20CrossChain for ${chain.name}.`);
    const provider = ethers.getDefaultProvider(chain.rpc);
    chain.wallet = wallet.connect(provider);
    chain.contract = await deployUpgradable(
        chain.constAddressDeployer,
        wallet,
        ERC20CrossChain,
        ERC20CrossChainProxy,
        [chain.gateway, chain.gasService, decimals],
        [],
        ethers.utils.defaultAbiCoder.encode(['string', 'string'], [name, symbol]),
        key,
    );
    console.log(`Deployed ERC20CrossChain for ${chain.name} at ${chain.contract.address}.`);
}

// async function execute(chains, wallet, options) {
//     const args = options.args || [];
//     const { source, destination, calculateBridgeFee } = options;
//     const amount = parseInt(args[2]) || 1e5;

//     async function print() {
//         console.log(`Balance at ${source.name} is ${await source.contract.balanceOf(wallet.address)}`);
//         console.log(`Balance at ${destination.name} is ${await destination.contract.balanceOf(wallet.address)}`);
//     }

//     const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

//     const initialBalance = await destination.contract.balanceOf(wallet.address);
//     console.log('--- Initially ---');
//     await print();

//     const fee = await calculateBridgeFee(source, destination);
//     await (await source.contract.giveMe(amount)).wait();
//     console.log('--- After getting some token on the source chain ---');
//     await print();

//     await (
//         await source.contract.transferRemote(destination.name, wallet.address, amount, {
//             value: fee,
//         })
//     ).wait();

//     while (true) {
//         const updatedBalance = await destination.contract.balanceOf(wallet.address);
//         if (updatedBalance.gt(initialBalance)) break;
//         await sleep(2000);
//     }

//     console.log('--- After ---');
//     await print();
// }

async function main() {
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY);
    console.log(wallet.address);
    // console.log(ERC20CrossChain.bytecode);
    const key = new Date().getTime().toString();
    const chain = {
        name: 'bscTestnet',
        rpc: 'https://data-seed-prebsc-1-s2.bnbchain.org:8545',
        gateway: '0x4D147dCb984e6affEEC47e44293DA442580A3Ec0',
        gasService: '0xbE406F0189A0B4cf3A05C286473D23791Dd44Cc6',
    };
    // console.log(wallet.connect(ethers.getDefaultProvider(chain.rpc)));
    await deploy(chain, wallet, key);
}

main();
