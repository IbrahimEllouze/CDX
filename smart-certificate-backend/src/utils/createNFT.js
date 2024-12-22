const { 
    TokenCreateTransaction, 
    TokenType, 
    TokenMintTransaction, 
    PrivateKey ,
    Hbar
} = require("@hashgraph/sdk");
const client = require("../config/hederaClient");

async function createNFT(tokenName, tokenSymbol) {
    const supplyKey = PrivateKey.generate();
    console.log("Generated Supply Key:", supplyKey.toString());
    process.env.HEDERA_SUPPLY_KEY = supplyKey.toString();

    const transaction = await new TokenCreateTransaction()
        .setTokenName(tokenName)
        .setTokenSymbol(tokenSymbol)
        .setTokenType(TokenType.NonFungibleUnique)
        .setTreasuryAccountId(process.env.HEDERA_ACCOUNT_ID)
        .setInitialSupply(0)
        .setSupplyKey(supplyKey)
        .setMaxTransactionFee(new Hbar(100))
        .execute(client);

    const receipt = await transaction.getReceipt(client);
    return receipt.tokenId.toString();
}

async function mintNFT(tokenId, metadata) {
    const supplyKey = PrivateKey.fromString(process.env.HEDERA_SUPPLY_KEY);
    
    // Convert metadata to a compact format and limit size
    const compactMetadata = {
        cid: metadata.certificateId,
        hn: metadata.holderName,
        in: metadata.institutionName,
        id: metadata.issueDate,
        ed: metadata.expirationDate || null
    };
    
    // Convert to buffer and check size
    const metadataBuffer = Buffer.from(JSON.stringify(compactMetadata));
    if (metadataBuffer.length > 100) {  // Hedera has a metadata size limit
        throw new Error("Metadata size exceeds limit after compression");
    }

    const transaction = await new TokenMintTransaction()
        .setTokenId(tokenId)
        .addMetadata(metadataBuffer)
        .freezeWith(client);

    const signedTransaction = await transaction.sign(supplyKey);
    const response = await signedTransaction.execute(client);
    const receipt = await response.getReceipt(client);

    return {
        status: receipt.status,
        compactMetadata: compactMetadata
    };
}

module.exports = { createNFT, mintNFT };