const crypto = require("crypto");

function generateMetadata(certificate) {
  return {
    certificateId: certificate.certificateId,
    holderName: certificate.holderName,
    institutionName: certificate.institutionName,
    issueDate: certificate.issueDate,
    expirationDate: certificate.expirationDate || null,
  };
}

function hashMetadata(metadata) {
  const metadataString = JSON.stringify(metadata);
  return crypto.createHash("sha256").update(metadataString).digest("hex");
}

module.exports = { generateMetadata, hashMetadata };
