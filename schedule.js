const cron = require("node-cron");
const { Worker } = require("worker_threads");
const path = require("path");
const logger = require("./utils/winstonLogger");

// Yeni worker thread oluşturuluyor
const transactionChecker = new Worker(
  path.join(__dirname, "workers", "transactionChecker.js")
);

// Cron job her 10 saniyede bir çalışacak şekilde ayarlanıyor
const task = cron.schedule("*/90 * * * * *", async () => {
  logger.info("Scheduled task started");
  transactionChecker.postMessage(0); // Worker thread'e mesaj gönderiliyor
});

module.exports = () => {
  task.start(); // Cron job başlatılıyor
};
