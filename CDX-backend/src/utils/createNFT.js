// Import required modules from Hedera SDK
const { 
    TokenCreateTransaction, 
    TokenType, 
    TokenMintTransaction, 
    PrivateKey ,
    Hbar
} = require("@hashgraph/sdk");
const client = require("../config/hederaClient");

// Function to create a new non-fungible token (NFT)
async function createNFT(tokenName, tokenSymbol) {
    // Generate a supply key for the token
    const supplyKey = PrivateKey.generate();
    console.log("Generated Supply Key:", supplyKey.toString());
    
    // Store the generated supply key in the environment variable
    process.env.HEDERA_SUPPLY_KEY = supplyKey.toString();

    // Create a transaction to define the NFT
    const transaction = await new TokenCreateTransaction()
        .setTokenName(tokenName) // Set the name of the token
        .setTokenSymbol(tokenSymbol) // Set the symbol of the token
        .setTokenType(TokenType.NonFungibleUnique) // Specify the token type as Non-Fungible Unique
        .setTreasuryAccountId(process.env.HEDERA_ACCOUNT_ID) // Set the treasury account for the token
        .setInitialSupply(0) // Set the initial supply to 0
        .setSupplyKey(supplyKey) // Assign the supply key to the token
        .setMaxTransactionFee(new Hbar(100)) // Set the maximum transaction fee
        .execute(client); // Execute the transaction on the Hedera network

    // Get the receipt for the transaction to retrieve the token ID
    const receipt = await transaction.getReceipt(client);
    return receipt.tokenId.toString(); // Return the token ID as a string
}

// Function to mint a new NFT with metadata
async function mintNFT(tokenId, metadata) {
    // Retrieve the supply key from the environment variable
    const supplyKey = PrivateKey.fromString(process.env.HEDERA_SUPPLY_KEY);
    
    // Compact the metadata to reduce size
    const compactMetadata = {
        cid: metadata.certificateId, // Certificate ID
        hn: metadata.holderName, // Holder Name
        in: metadata.institutionName, // Institution Name
        id: metadata.issueDate, // Issue Date
        ed: metadata.expirationDate || null // Expiration Date (optional)
    };
    
    // Convert metadata to a buffer and check its size
    const metadataBuffer = Buffer.from(JSON.stringify(compactMetadata));
    if (metadataBuffer.length > 100) {  // Hedera has a metadata size limit
        throw new Error("Metadata size exceeds limit after compression");
    }

    // Create a transaction to mint the NFT
    const transaction = await new TokenMintTransaction()
        .setTokenId(tokenId) // Set the token ID for the NFT
        .addMetadata(metadataBuffer) // Add the metadata to the NFT
        .freezeWith(client); // Freeze the transaction to prepare for signing

    // Sign the transaction with the supply key
    const signedTransaction = await transaction.sign(supplyKey);
    
    // Execute the signed transaction on the Hedera network
    const response = await signedTransaction.execute(client);
    
    // Get the receipt for the transaction to check the status
    const receipt = await response.getReceipt(client);

    return {
        status: receipt.status, // Return the status of the minting transaction
        compactMetadata: compactMetadata // Include the compacted metadata in the response
    };
}

// Export the functions for external use
module.exports = { createNFT, mintNFT };
