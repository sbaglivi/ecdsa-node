const secp = require("ethereum-cryptography/secp256k1");
const { keccak256 } = require("ethereum-cryptography/keccak");
const { utf8ToBytes, toHex } = require("ethereum-cryptography/utils");



function hashMessage(message){
    return keccak256(utf8ToBytes(message));
}


  // ebeab1d4a20e4fedcdf389fee3c381c42b302f50ffe00fa61cf1ec8698866535
//   "97ced11e7f685fdc89e6fe6798c776400e5e0055": 100,
async function recoverKey(message, signature, recoveryBit) {
    return secp.recoverPublicKey(hashMessage(message), signature, recoveryBit);
}

async function main(){
    const messageBody = {
        to: "952b3b3dfe1ef47a2322d08308e8f672d907753f",
        amount: 8
    }
    const privateKey = "ebeab1d4a20e4fedcdf389fee3c381c42b302f50ffe00fa61cf1ec8698866535";

    const msgHash = hashMessage(JSON.stringify(messageBody));
    let signature = secp.secp256k1.sign(msgHash, privateKey);
    let recovery = signature.recovery;
    let serialized = signature.toCompactHex()
    signature = secp.secp256k1.Signature.fromCompact(serialized)
    signature = signature.addRecoveryBit(recovery);
    console.log('signature:', signature);
    console.log(toHex(secp.secp256k1.getPublicKey(privateKey)))
    console.log(signature.recoverPublicKey(msgHash).toHex())
}

main()