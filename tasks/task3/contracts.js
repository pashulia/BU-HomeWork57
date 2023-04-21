const ethers = require('ethers');
const fs = require('fs');
const solc = require('solc');

function myCompiler(solc, fileName, contractName, contractCode) {
    // настраиваем структуру input для компилятора
    let input = {
        language: 'Solidity',
        sources: {
            [fileName]: {
                content: contractCode
            }
        },
        settings: {
            outputSelection: {
                '*': {
                    '*': ['*']
                }
            }
        }
    };

    let output = JSON.parse(solc.compile(JSON.stringify(input)));
    let ABI = output.contracts[fileName][contractName].abi;
    let bytecode = output.contracts[fileName][contractName].evm.bytecode.object;

    fs.writeFileSync(__dirname + '/' + contractName + '.abi', JSON.stringify(ABI));
    fs.writeFileSync(__dirname + '/' + contractName + '.bin', bytecode);

    return output.contracts[fileName][contractName];   
}

async function main() {
    let endPointLocal = 'http://127.0.0.1:7545';
    const provider = new ethers.providers.JsonRpcProvider(endPointLocal);
    const list = await provider.listAccounts();
    const signer = provider.getSigner(list[0]);

    const fName = 'example.sol';
    const cName = 'Example';
    const cCode = fs.readFileSync(__dirname + '/' + fName, 'utf-8');
    
    let exampleFactory = ethers.ContractFactory.fromSolidity(myCompiler(solc, fName, cName, cCode));
    exampleFactory = exampleFactory.connect(signer);
    let example = await exampleFactory.deploy();
    await example.deployed();
    
    let filterReceive = {
        address: example.address,
        topics: [
            ethers.utils.id("Recive(address, uint256)")
        ]
    };

    let filterSetData = {
        address: example.address,
        topics: [
            ethers.utils.id("SetData(uint256, string, uint256[])")
        ]
    };

    provider.on(filterReceive, log => {
        console.log("Receive event start");
        console.log(log);
        console.log("Receive event end");
    });

    provider.on(filterSetData, log => {
        console.log("SetData event start");
        console.log(log);
        console.log("SetData event end");
    });

    let txRequest = await signer.populateTransaction({
        to: example.address,
        value: 10000000
    });

    let tx = await signer.sendTransaction(txRequest);
    await tx.wait();

    tx = await example.setData(100, "Hello", [1, 2, 3]);
    await tx.wait();
}

main();