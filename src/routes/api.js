const express = require("express");
const { generateMetadata, hashMetadata } = require("../utils/metadata");
const { createNFT, mintNFT } = require("../utils/createNFT");
const submitHash = require("../utils/submitHash");
const getHashFromHedera = require("../utils/queryHash");
const verifyCertificate = require("../utils/verification");
const generateQRCode = require("../utils/qrCode");

const router = express.Router();

router.post("/issue", async (req, res) => {
    try {
        const metadata = generateMetadata(req.body);
        const hash = hashMetadata(metadata);

        // Submit hash with certificate ID
        await submitHash(process.env.HEDERA_TOPIC_ID, metadata.certificateId, hash);
        const tokenId = await createNFT("Certificate", "CERT");
        await mintNFT(tokenId, metadata);

        const qrCode = await generateQRCode(
            `${process.env.VERIFICATION_URL}?id=${metadata.certificateId}`
        );
        
        res.json({ tokenId, qrCode, hash });
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// Add new endpoint to get hash
router.get("/hash/:certificateId", async (req, res) => {
  try {
      const hash = await getHashFromHedera(
          process.env.HEDERA_TOPIC_ID,
          req.params.certificateId
      );

      if (!hash) {
          return res.status(404).json({
              success: false,
              error: "No hash found for the given certificate ID",
          });
      }

      res.json({ success: true, hash });
  } catch (error) {
      console.error("Error in /hash/:certificateId:", error.message);
      res.status(500).json({
          success: false,
          error: "An internal error occurred while fetching the hash.",
      });
  }
});


// Update verify endpoint
router.get("/verify/:certificateId", async (req, res) => {
    try {
        const storedHash = await getHashFromHedera(
            process.env.HEDERA_TOPIC_ID,
            req.params.certificateId
        );
        
        if (!storedHash) {
            return res.status(404).json({ 
                error: "Certificate not found" 
            });
        }

        const metadata = generateMetadata(req.body);
        const isValid = await verifyCertificate(metadata, storedHash);
        res.json({ isValid });
    } catch (error) {
        res.status(500).send(error.message);
    }
});

module.exports = router;