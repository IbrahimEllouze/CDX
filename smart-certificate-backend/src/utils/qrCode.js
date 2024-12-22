const crypto = require("crypto");

async function verifyCertificate(providedMetadata, hashFromHedera) {
  const providedHash = crypto.createHash("sha256").update(JSON.stringify(providedMetadata)).digest("hex");
  return providedHash === hashFromHedera;
}

module.exports = verifyCertificate;

// src/utils/qrCode.js
const QRCode = require("qrcode");

async function generateQRCode(data) {
  return await QRCode.toDataURL(data);
}

module.exports = generateQRCode;