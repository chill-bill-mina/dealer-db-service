const mongoose = require("mongoose");
const Admin = require("../models/admin");
const config = require("config");

mongoose.connect(config.get("database.uri"), {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function createAdmin(address) {
  try {
    let admin = await Admin.findOne({ address });

    if (admin) {
      console.log("This admin already exists.");
    } else {
      admin = new Admin({
        address,
        nonce: Math.floor(Math.random() * 1000000),
      });
      await admin.save();
      console.log("Admin created successfully.");
    }
  } catch (err) {
    console.error("an error occured while admin creating:", err);
  } finally {
    mongoose.connection.close();
  }
}

// // usage
// const adminAddress = "adminwalletaddress";
// createAdmin(adminAddress);
