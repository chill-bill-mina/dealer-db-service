const Admin = require("../../models/admin");
const config = require("config");
const jwt = require("jsonwebtoken");
var Client = require("mina-signer");

var signerClient = new Client({ network: config.get("network.name") });

exports.getNonce = async (req, res, next) => {
  const { address } = req.body;

  if (!address) return res.status(400).send("Address is required");

  const admin = await Admin.findOne({ address });

  if (!admin) {
    return res.status(403).send("Access denied");
  }

  res.json({ nonce: admin.nonce });
};

exports.verify = async (req, res, next) => {
  const { address, signature } = req.body;

  if (!address || !signature)
    return res.status(400).send("Address and signature are required");

  const admin = await Admin.findOne({ address });
  if (!admin) return res.status(403).send("Access denied");

  const verifyBody = {
    data: admin.nonce,
    publicKey: address,
    signature: signature,
  };

  const verifyResult = signerClient.verifyMessage(verifyBody);
  if (verifyResult) {
    console.log("Signature verification is successful.");
    admin.nonce = Math.floor(Math.random() * 1000000);
    await admin.save();

    const token = jwt.sign(
      { address: admin.address, role: "admin" },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h",
      }
    );

    res.json({ token });
  } else {
    res.status(401).send("Signature verification failed");
  }
};
