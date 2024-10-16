const { parentPort } = require("worker_threads");
const { request, gql } = require("graphql-request");
const mongoose = require("mongoose");
const Purchase = require("../models/purchase"); // Purchase modelini içe aktar
const logger = require("../utils/winstonLogger");
const config = require("config");

// Function to check the transaction status
const blockberry = require("@api/blockberry");
const purchase = require("../models/purchase");
const { error } = require("console");

blockberry.auth(config.get("mina_api.key"));

async function checkTransactionStatus(txHash) {
  try {
    const { data } = await blockberry.getZkAppTransactionByTxHash({ txHash });
    logger.info(data.txStatus);
    return data.txStatus;
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
    });
    console.log(purchases);

    for (const purchase of purchases) {
      if (
        purchase.contractDetails.deploy.transactionHash &&
        !purchase.contractDetails.deploy.isDeployed
      ) {
        const status = await checkTransactionStatus(
          purchase.contractDetails.deploy.transactionHash
        );

        if (status === "applied") {
          // Update the purchase to mark it as deployed
          purchase.contractDetails.deploy.isDeployed = true;
          await purchase.save();
          logger.info(`Purchase ${purchase._id} marked as deployed.`);
        } else if (status === "failed") {
          // Update the purchase to mark it as failed
          purchase.contractDetails.deploy.isDeployed = false;
          purchase.contractDetails.deploy.transactionHash = "";
          await purchase.save();
          logger.info(`Purchase ${purchase._id} marked as failed.`);
        } else {
          logger.info(
            `Transaction ${purchase.contractDetails.deploy.transactionHash} is still ${status}`
          );
        }
      }
      if (
        purchase.contractDetails.init.transactionHash &&
        !purchase.contractDetails.init.isInitialized
      ) {
        const status = await checkTransactionStatus(
          purchase.contractDetails.init.transactionHash
        );
        if (status === "applied") {
          // Update the purchase to mark it as deployed
          purchase.contractDetails.init.isInitialized = true;
          await purchase.save();
          logger.info(`Purchase ${purchase._id} marked as initialized.`);
        } else if (status === "failed") {
          // Update the purchase to mark it as failed
          purchase.contractDetails.init.isInitialized = false;
          purchase.contractDetails.init.transactionHash = "";
          await purchase.save();
          logger.info(`Purchase ${purchase._id} marked as failed.`);
        } else {
          logger.info(
            `Transaction ${purchase.contractDetails.init.transactionHash} is still ${status}`
          );
        }
      }

      if (
        purchase.contractDetails.sell.transactionHash &&
        !purchase.contractDetails.sell.isSold
      ) {
        const status = await checkTransactionStatus(
          purchase.contractDetails.sell.transactionHash
        );
        if (status === "applied") {
          // Update the purchase to mark it as deployed
          purchase.contractDetails.sell.isSold = true;
          purchase.status = "completed";
          await purchase.save();
          logger.info(`Purchase ${purchase._id} marked as sold.`);
        } else if (status === "failed") {
          // Update the purchase to mark it as failed
          purchase.contractDetails.sell.isSold = false;
          purchase.contractDetails.sell.transactionHash = "";
          await purchase.save();
          logger.info(`Purchase ${purchase._id} marked as failed.`);
        } else {
          logger.info(
            `Transaction ${purchase.contractDetails.sell.transactionHash} is still ${status}`
          );
        }
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
