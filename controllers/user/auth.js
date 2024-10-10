const User = require("../../models/user");
const config = require("config");
const jwt = require("jsonwebtoken");
var Client = require("mina-signer");

var signerClient = new Client({ network: config.get("network.name") });

exports.getNonce = async (req, res, next) => {
  const { address } = req.body;

  if (!address) return res.status(400).send("Address is required");

  let user = await User.findOne({ address });

  if (!user) {
    user = new User({ address });
    await user.save();
  }

  res.json({ nonce: user.nonce });
};

exports.verify = async (req, res, next) => {
  const { address, signature } = req.body;

  if (!address || !signature)
    return res.status(400).send("Address and signature are required");

  const user = await User.findOne({ address });
  if (!user) return res.status(400).send("User not found");

  const msg = `Nonce: ${user.nonce}`;

  const verifyBody = {
    data: user.nonce.toString(), // Signature content that needs to be verified.
    publicKey: address, // Public key that needs to be verified.
    signature: signature, // Signature results that need to be verified.
  };

  const verifyResult = signerClient.verifyMessage(verifyBody);
  if (verifyResult) {
    console.log("Signature verification is successful.");
    user.nonce = Math.floor(Math.random() * 1000000);
    await user.save();
    const token = jwt.sign({ address: user.address }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.json({ token });
  } else {
    res.status(401).send("Signature verification failed");
  }
};
