const ethers = require('ethers');
const readlineSync = require('readline-sync');

async function main() {
    const provider = new ethers.providers.JsonRpcProvider('http://127.0.0.1:7545');
    //0x4bffae82f9015aa717db5b732a6d8876005c4213653836ce2572b04d8226b010
    let privateKey = readlineSync.question("Введите закрытый ключь: ")
    let wallet = new ethers.Wallet(privateKey);
    // Подписка на новые транзакции
    provider.on("pending", transaction => {
        if (transaction.to === wallet.address || transaction.from === wallet.address) {
            console.log(transaction);
        }
    })

    const list = await provider.listAccounts();
    const signer = provider.getSigner(list[0]);

    let txRequest = await signer.populateTransaction({
        to: wallet.address,
        value: 100000000,
    })

    let tx = await signer.sendTransaction(txRequest);
    await tx.wait()

    wallet = wallet.connect(provider);

    let txRequestRev = await wallet.populateTransaction({
        to: signer._address,
        value: 100000000,
    })

    tx = await wallet.sendTransaction(txRequestRev);
    await tx.wait()
}

main();