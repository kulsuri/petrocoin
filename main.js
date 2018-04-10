'use strict'

// import the sha356 function from the crypto-js library
const SHA256 = require('crypto-js/sha256');

// Block class contains everything require to create a block
class Block{
    
    // method for creating and initializing an object created with a class
    constructor(index, timestamp, data, previousHash){

        // index = where the block sits on the chain
        this.index = index; 

        // timestamp = when the block was created
        this.timestamp = timestamp;
        
        // data = any type of data you want to associate with this block
            // in the case of a currency, you might want to store the details of the transaction in here
            // such as: (1) how much money was transferred, (2) sender, (3) receiver
        this.data = data;
        
        // previousHash = string that contains the hash of the block before this one
            // ensure the integrity of the blockchain
        this.previousHash = previousHash;
        
        // add another property to the class: hash property
            // this will contain the hash of our block so we need a way to calculate it
        this.hash = this.calculateHash();

        // nonce = random value
            // this is required for mining the block in order to calculate a hash with the difficulty number of zeros at the start
            // has nothing to do with the block but can be changed to something random
        this.nonce = 0;
        
    }

    // this method calculates the hash function of this block
        // it will take the properties of this block, run it through a hash function and return the hash
        // this will identify our block on the blockchain
    calculateHash(){
        
        // return a SHA256 hash of the block properties: index, previousHash, timestamp, data, nonce
        return SHA256(this.index + this.previousHash + this.timestamp + JSON.stringify(this.data) + this.nonce).toString()
    
    }

    // this method will mine blocks on the blockchain
        // it will take a property called 'difficulty' 
        // inside this method, we will make the hash of a block begin with a certain number of zeros (the more zeros = the harder it is to mine)
    mineBlock(difficulty){

        // this while loop will keep running until the hash of the block starts with enough zeros - this is dependant on the difficulty property
            // the while loop will take a substring of the blocks hash as a property, starting at character 0 and stopping at the character defined by 'difficulty'
            // the while loop will keep running for as long as the substring of the hash is not equal to all zeros 
            // array of length difficulty+1 joined to character 0 is a quick way to make a string of zeros which is exactly the length of difficulty
        while(this.hash.substring(0, difficulty) !== Array(difficulty + 1).join("0") ){

            // increment nonce value by 1 on each pass of the while loop for as long as the hash does not start with enough zeros
            this.nonce++;

            // calculate the hash of this block
            this.hash = this.calculateHash();
        }

        // after the while loop has completed, confirm block has been mined
        console.log("Block mined: " + this.hash);

    }
}

// Blockchain class which contains the blockchain (ledger), verifies blocks and add blocks to the blockchain
class Blockchain{

    // method responsible for initializing the blockchain
    constructor(){

        // chain is an array of blocks - this is the ledger
            // first element calls createGenesisBlock method to insert the first block
        this.chain = [this.createGenesisBlock()];

        // blockchain difficulty level
            // this is the number of zeros the hash of each block will have to begin with
            // as more blocks are added to the chain, the difficulty becomes greater - this is how Bitcoin works
            // in this example, difficulty is set to 2 so the hashes of the blocks will start with 00
        this.difficulty = 2
    }

    // the first block on the blockchain is called a genesis block and should be added manually - create the method below to do this
    createGenesisBlock(){
        return new Block(0, "01/01/2018", "Genesis Block", "0");
    }

    // method to get the latest block: returns the last element from the this.chain array
    getLatestBlock(){
        return this.chain[this.chain.length - 1];
    }

    // method which receives new blocks and adds them to the blockchain array
    addBlock(newBlock){

        // before adding a block to the blockchain, it needs to set the previousHash to the last block on the chain
        newBlock.previousHash = this.getLatestBlock().hash;
        
        // now that we've changed the the block, we need to update its hash
            // the block is 'mined' and the hash is created which starts with the number of zeros defined by the difficulty property
        newBlock.mineBlock(this.difficulty)
        
        // now we can push this block onto the chain
        this.chain.push(newBlock);
    }

    // method to check the integrity of the blockchain
    isChainValid(){
        
        // loop over the entire blockchain, start at index 1 i.e. skip genesis block as the 2 checks wont work on the genesis block (block 0)
        for(let i = 1; i < this.chain.length; i++){
            const currentBlock = this.chain[i];
            const previousBlock = this.chain[i-1];

            // check if the hash property of the current block is equal to calculation of the hash of the current block
            if(currentBlock.hash !== currentBlock.calculateHash()){
                return false;
            }

            // check if the previous hash property is correctly set
            if(currentBlock.previousHash !== previousBlock.hash){
                return false;
            }
        }
        return true;
    }
}

// TESTING THE BLOCKCHAIN
// ----------------------

// 1. INITIATE PETROCOIN
// *********************

// to test, create an instance of the blockchain in a variable called petroCoin
let petroCoin = new Blockchain();

// print the blockchain - no transactions have occured yet
console.log("");console.log("*-------------------------------------*");console.log("Only Genesis Block on the Blockchain...");console.log("*-------------------------------------*");console.log("");
console.log(JSON.stringify(petroCoin, null, 4));

// 2. MINE SOME BLOCKS
// *******************

// add a new block (transaction 1) i.e. Mine a block! the hash should start with 2 zeros
console.log("");console.log("*--------------------------*");console.log("Mining block 1...");console.log("*--------------------------*");console.log("");
petroCoin.addBlock(new Block(1, "12/01/2018", { amount: 4}));

// add another new block (transaction 2) i.e. Mine the next block! this hash should also start with 2 zeros
console.log("");console.log("*--------------------------*");console.log("Mining block 2...");console.log("*--------------------------*");console.log("");
petroCoin.addBlock(new Block(2, "21/01/2018", { amount: 24}));

// print the blockchain - now 2 transactions have occured
console.log("");console.log("*--------------------------*");console.log("Now Blockchain looks like...");console.log("*--------------------------*");console.log("");
console.log(JSON.stringify(petroCoin, null, 4));

// 3. INTEGRITY / NON-REPEDIATION CHECK
// ************************************

// print the result of the integrity test on the blockchain (pre-tamper) - result is True
console.log("");console.log("*--------------------------------*");console.log("Pre-tampering of the Blockchain...");console.log("*--------------------------------*");console.log("");
console.log('Is Blockchain valid...? Answer:               ' + petroCoin.isChainValid());

// now we tamper with the blockchain by changing the amount of transaction 1 (block index 1)
petroCoin.chain[1].data = { amount: 400 }

// print integrity test on the blockchain (post-tamper) - result is false
console.log("");console.log("*--------------------------------*");console.log("Post-tampering of the Blockchain...");console.log("*--------------------------------*");console.log("");
console.log('Is Blockchain valid...? Answer:               ' + petroCoin.isChainValid());
