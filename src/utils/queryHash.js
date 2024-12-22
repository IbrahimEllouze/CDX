const { 
    TopicMessageQuery,
    Timestamp
} = require("@hashgraph/sdk");
const client = require("../config/hederaClient");

async function getHashFromHedera(topicId, certificateId, startTime = null) {
    try {
        // Use current time if no valid start time is provided
        const now = Timestamp.fromDate(new Date());
        const queryStartTime = startTime && Timestamp.fromDate(new Date(startTime)) < now
            ? startTime
            : Timestamp.fromDate(new Date(Date.now() - (60 * 60 * 1000))); // Default to 1 hour ago

        // Create the topic message query
        const query = new TopicMessageQuery()
            .setTopicId(topicId)
            .setStartTime(queryStartTime);

        // Collect messages
        const messages = [];
        await query.subscribe(
            client,
            (message) => {
                if (message && message.contents) {
                    messages.push({
                        consensusTimestamp: message.consensusTimestamp,
                        contents: message.contents.toString(),
                    });
                }
            }
        );

        // Wait for messages to accumulate
        await new Promise((resolve) => setTimeout(resolve, 5000));

        // Filter messages for the given certificate ID
        const latestHash = messages
            .reverse()
            .find((msg) => msg.contents.includes(certificateId));

        return latestHash ? latestHash.contents : null;
    } catch (error) {
        console.error("Error querying hash from Hedera:", error);
        throw error;
    }
}

module.exports = getHashFromHedera;