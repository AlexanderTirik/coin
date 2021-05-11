const crypto = require('crypto');

class Transaction {
  constructor(fromAddress, toAddress, amount) {
    this.fromAddress = fromAddress;
    this.toAddress = toAddress;
    this.amount = amount;
    this.timestamp = Date.now();
  }

  calculateHash() {
    return crypto.createHash('sha256').update(this.fromAddress + this.toAddress + this.amount + this.timestamp).digest('hex');
  }
}

class Block {
  constructor(timestamp, transactions, merkle = '', previousHash = '') {
    this.previousHash = previousHash;
    this.timestamp = timestamp;
    this.transactions = transactions;
    this.merkle = merkle;
    this.nonce = 0;
    this.hash = this.calculateHash();
  }

  calculateHash() {
    return crypto.createHash('sha256').update(this.previousHash + this.timestamp + JSON.stringify(this.transactions) + this.nonce + this.merkle).digest('hex');
  }

  mineBlock(difficulty) {
    while (this.hash.substring(0, difficulty) !== Array(difficulty + 1).join('0')) {
      this.nonce++;
      this.hash = this.calculateHash();
    }

    console.log(`Block mined: ${this.hash}`);
  }
}

class Blockchain {
  constructor(chain, difficulty) {
    this.chain = chain || [this.createGenesisBlock()];
    this.difficulty = difficulty || 2;
    this.pendingTransactions = [];
  }

  createGenesisBlock() {
    return new Block(Date.parse('1945-01-01'), [], '0', '0');
  }

  getLatestBlock() {
    return this.chain[this.chain.length - 1];
  }

  addTransaction(transaction) {
    if (!transaction.fromAddress || !transaction.toAddress) {
      throw new Error('Transaction must include from and to address');
    }
    
    if (transaction.amount <= 0) {
      throw new Error('Transaction amount should be higher than 0');
    }
    
    if (this.getBalanceOfAddress(transaction.fromAddress).amount < transaction.amount) {
      throw new Error('Not enough balance');
    }

    this.pendingTransactions.push(transaction);
    console.log('transaction added: ', transaction);
  }

  getBalanceOfAddress(address) {
    let balance = 0;
    let min;
    let max;

    for (const block of this.chain) {
      for (const trans of block.transactions) {
        if (trans.fromAddress === address) {
          balance -= trans.amount;
        }

        if (trans.toAddress === address) {
          balance += trans.amount;
        }
        if (!min && !max) {
          min = balance;
          max = balance;
        }
        min = Math.min(min, balance);
        max = Math.max(max, balance);
      }
    }
    return { amount: balance, min, max };
  }

  getBalancesForBlock(number) {
    const balances = {};
    const length = Math.min(number, this.chain.length);
    for(let i = 0; i < length; i++) {
      for (const trans of this.chain[i].transactions) {
        if (!balances[trans.fromAddress]) balances[trans.fromAddress] = 0;
        if (!balances[trans.toAddress]) balances[trans.toAddress] = 0;
        balances[trans.fromAddress] -= trans.amount;
        balances[trans.toAddress] += trans.amount;
      }
    }
    return balances;
  }

  getMerkleRoot(hashes, i) {
    const parentHashes = [];
    if (!hashes) {
      const croppedChain = i ? this.chain.slice(0, i) : this.chain;
      hashes = croppedChain.map(c => c.hash);
    }
    if (hashes.length === 1) {
      return hashes[0];
    }
    for(let i = 0; i < hashes.length; i += 2) {
      const parentHash = hashes[i + 1] ? crypto.createHash('sha256').update(hashes[i] + hashes[i + 1]).digest('hex') : hashes[i];
      parentHashes.push(parentHash);
    }
    return this.getMerkleRoot([...parentHashes]);
  }

  minePendingTransactions() {
    const block = new Block(Date.now(), this.pendingTransactions, this.getMerkleRoot(), this.getLatestBlock().hash);
    block.mineBlock(this.difficulty);

    this.chain.push(block);

    this.pendingTransactions = [];
  }

  isChainValid() {
    const realGenesis = JSON.stringify(this.createGenesisBlock());

    if (realGenesis !== JSON.stringify(this.chain[0])) {
      return false;
    }

    for (let i = 1; i < this.chain.length; i++) {
        const currentBlock = this.chain[i];
        const previousBlock = this.chain[i - 1];
      
      if (currentBlock.merkle !== this.getMerkleRoot(null, i)) {
        return false;
      }

      if (currentBlock.hash !== currentBlock.calculateHash()) {
        return false;
      }
      if (currentBlock.previousHash !== previousBlock.hash) { 
          return false;
      }
    }

    return true;
  }
}

module.exports.Blockchain = Blockchain;
module.exports.Block = Block;
module.exports.Transaction = Transaction;