const { Client, TopicCreateTransaction } = require("@hashgraph/sdk");
require("dotenv").config();

// Initialize the Hedera client
const client = Client.forTestnet(); // Use Client.forMainnet() for production
client.setOperator(process.env.HEDERA_ACCOUNT_ID, process.env.HEDERA_PRIVATE_KEY);

async function createTopic() {
  try {
    const transaction = await new TopicCreateTransaction().execute(client);
    const receipt = await transaction.getReceipt(client);
    const topicId = receipt.topicId;
    console.log("Your Topic ID is:", topicId.toString());
    return topicId.toString();
  } catch (error) {
    console.error("Error creating topic:", error);
  }
}

createTopic();
