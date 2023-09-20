const secp = require("ethereum-cryptography/secp256k1");
const {keccak256} = require("ethereum-cryptography/keccak");
const { utf8ToBytes, toHex } = require("ethereum-cryptography/utils");
const express = require("express");
const app = express();
const cors = require("cors");
const port = 3042;
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./server.db');

db.run("CREATE TABLE IF NOT EXISTS accounts (id VARCHAR(40) NOT NULL, balance INTEGER NOT NULL);")
app.use(cors());
app.use(express.json());

// const balances = {
//   // ebeab1d4a20e4fedcdf389fee3c381c42b302f50ffe00fa61cf1ec8698866535
//   "97ced11e7f685fdc89e6fe6798c776400e5e0055": 100,
//   // 30b81b8ba98c1d56845246fc785d72bd6f0e0c05ac07a1cd6c98171fbc7466a0
//   "952b3b3dfe1ef47a2322d08308e8f672d907753f": 50,
//   // 453fcfa6ccd8dcd92a33c0b2aca01f70ada5d552db4fdfb595f0e3af5b13a377
//   "a817e4d91636c83db5956406e90d555ba7c47238": 75,
// };

async function getBalanceByAddress(address){
  return new Promise((resolve, reject) => {
    db.get("SELECT balance FROM accounts WHERE id = ?;", address, (err, result) => {
      if (err){
        console.log(err)
        reject(err)
        return
      }
      if (result === undefined){
        reject("address not found")
        return // needed because apparently while it does set the promise as rejected and this is unchangeable,
        // it does not stop execution of code
      }
      resolve(result.balance);
    })
  })
}

async function setAccountBalance(address, balance){
  return new Promise((resolve, reject) => {
    db.run("UPDATE accounts SET balance = ? WHERE id = ?", balance, address, err => {
      if (err === null) {
        resolve();
        return;
      }
      reject(err)
    });
  })
}

async function beginTransaction(){
  return new Promise((res, rej) => {
    db.run("BEGIN;", (err) => {
      if (err === null){
        res();
        return;
      }
      rej(err);
    })
  })
}

async function commitTransaction(){
  return new Promise((res, rej) => {
    db.run("COMMIT;", (err) => {
      if (err === null){
        res(true);
        return;
      }
      rej(err);
    })
  })
}

async function createAccount(address, startingBalance=0){
  return new Promise((res, rej) => {
    db.run("INSERT INTO accounts (id, balance) VALUES (?, ?)", address, startingBalance, (err) => {
      if (err === null){
        res();
        return;
      }
      rej(err);
    })
  })
}
 
app.get("/balance/:address", async (req, res) => {
  const { address } = req.params;
  const balance = await getBalanceByAddress(address)
  res.send({ balance });
});

app.post("/register", async (req,res) => {
  try {
    const { address } = req.body;
    console.log(address)
    if (!address) {
      throw new Error("missing address")
    }
    await createAccount(address, 25);
    res.status(201).send({message: "account created"})
  } catch (ex) {
    res.status(400).send({message: `while registering customer: ${ex}`})
  }
})

app.post("/login", async (req,res) => {
  try {
    const {address} = req.body;
    const balance = await getBalanceByAddress(address);
    console.log("logged balance", balance)
    res.send({message: `logged in successfully! balance: ${balance}`})
  } catch (ex) {
    res.status(400).send({message: `while logging in customer: ${ex}`})
  }
})

app.post("/send", async (req, res) => {
  let transactionStarted = false;
  try {
    const { message, signatureHex, recovery } = req.body;
    const {recipient, amount } = message;
    let signature = secp.secp256k1.Signature.fromCompact(signatureHex);
    signature = signature.addRecoveryBit(recovery)

    let publicKey = signature.recoverPublicKey(keccak256(utf8ToBytes(JSON.stringify(message)))).toRawBytes()
    let senderAddress = toHex(keccak256(publicKey.slice(1)).slice(-20));

    let senderBalance = await getBalanceByAddress(senderAddress);
    if (senderBalance < amount) {
      res.status(400).send({ message: "Not enough funds!" });
      return
    }
    transactionStarted = await beginTransaction();
    await setAccountBalance(senderAddress, senderBalance - amount);
    let recipientBalance = await getBalanceByAddress(recipient);
    await setAccountBalance(recipient, recipientBalance + amount);
    await commitTransaction();
    res.send({ balance: senderBalance - amount });
  } catch (ex) {
    console.log(ex);
    if (transactionStarted){
      db.run("ROLLBACK;");
    }
    res.status(400).send({message: ex})
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});