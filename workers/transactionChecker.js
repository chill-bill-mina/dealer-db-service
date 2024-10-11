const { parentPort } = require("worker_threads");
const { request, gql } = require("graphql-request");
const mongoose = require("mongoose");
const Purchase = require("../models/purchase"); // Purchase modelini içe aktar
const logger = require("../utils/winstonLogger");
const config = require("config");
// Mina devnet GraphQL endpoint
const MINA_GRAPHQL_ENDPOINT = "https://proxy.devnet.minaexplorer.com/graphql";

// GraphQL query to fetch the status of a transaction
const TRANSACTION_STATUS_QUERY = gql`
  query ($txHash: String!) {
    transactionStatus(payment: $txHash)
  }
`;

// Function to check the transaction status
async function checkTransactionStatus(txHash) {
  try {
    const variables = { txHash };
    const response = await request(
      MINA_GRAPHQL_ENDPOINT,
      TRANSACTION_STATUS_QUERY,
      variables
    );
    return response.transactionStatus;
  } catch (error) {
    logger.error("Error querying transaction status:", error);
    throw error;
  }
}

// Function to process purchases and check transaction status
async function processPurchases() {
  try {
    // Find all purchases with pending status and false isDeployed
    const purchases = await Purchase.find({
      status: "pending",
      isDeployed: false,
    });
    console.log(purchases);

    for (const purchase of purchases) {
      if (purchase.transactionHash) {
        const status = await checkTransactionStatus(purchase.transactionHash);

        if (status === "INCLUDED") {
          // Update the purchase to mark it as deployed
          purchase.isDeployed = true;
          purchase.status = "completed"; // İşlem tamamlandığında durumu da güncelleyebilirsiniz
          await purchase.save();
          logger.info(`Purchase ${purchase._id} marked as deployed.`);
        } else {
          logger.info(
            `Transaction ${purchase.transactionHash} is still ${status}`
          );
        }
      } else {
        logger.warn(`Purchase ${purchase._id} has no transaction hash.`);
      }
    }
  } catch (error) {
    logger.error("Error processing purchases:", error);
  }
}

// Listen for messages from the main thread
parentPort.on("message", async (message) => {
  logger.info("Worker received a message to start processing purchases.");

  try {
    // Initialize MongoDB connection
    await mongoose.connect(config.get("database.uri"));

    // Call the function to process purchases
    await processPurchases();

    // Close MongoDB connection after processing
    await mongoose.connection.close();

    // Optionally, send a message back to the main thread
    parentPort.postMessage("Purchase processing completed.");
  } catch (error) {
    logger.error("Error in worker:", error);
  }
});
