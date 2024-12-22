const { TopicMessageSubmitTransaction } = require("@hashgraph/sdk");
const client = require("../config/hederaClient");

async function submitHash(topicId, certificateId, hash) {
    // Store the hash with the certificate ID for easier retrieval
    const message = JSON.stringify({
        certificateId,
        hash
    });

    const transaction = await new TopicMessageSubmitTransaction()
        .setTopicId(topicId)
        .setMessage(message)
        .execute(client);

    const receipt = await transaction.getReceipt(client);
    return receipt.status;
}

module.exports = submitHash;