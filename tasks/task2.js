const ethers = require('ethers');

async function main() {
    const provider = new ethers.providers.JsonRpcProvider('http://127.0.0.1:7545');

    //  Подписка на новый блок
    provider.on("block", async (blockNumber) => { 
        let block = await provider.getBlockWithTransactions();
        let value = ethers.BigNumber.from(0);
        for(tx of block.transactions) {
            value = value.add(tx.value);
        }
        console.log("номер блока: ", blockNumber);
        console.log("кол-во транзакций в блоке: ", block.transactions.length);
        console.log("сумма всех транзакций: ", value.toBigInt());
    });

    const list = await provider.listAccounts();
    const signer = provider.getSigner(list[0]);

    let txRequest = await signer.populateTransaction({
        to: list[2],
        value: 100000000,
    })

    await signer.sendTransaction(txRequest);
}

main();