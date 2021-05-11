const { Blockchain, Transaction } = require('./blockchain');
const { getData, writeData } = require('./orm');

const wallet1 = 1;
const wallet2 = 2;
const difficulty = 2;

// first part

const coin = new Blockchain(null, difficulty);

const initTransaction = new Transaction('emission', wallet1, 100);
coin.pendingTransactions.push(initTransaction);

coin.minePendingTransactions();

const transaction1 = new Transaction(wallet1, wallet2, 40);
coin.addTransaction(transaction1)

coin.minePendingTransactions();

console.log(coin.getBalancesForBlock(3));

writeData(JSON.stringify(
    {
        difficulty,
        chain: coin.chain
    },
    null,
    ' '
))

// second part
const existBlockchain = JSON.parse(getData());
const existCoin = new Blockchain(existBlockchain.chain, existBlockchain.difficulty);

