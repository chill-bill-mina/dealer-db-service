exports.generateInvoiceNumber = () => {
  const datePart = new Date().toISOString().replace(/[-T:.Z]/g, "");
  const randomPart = Math.floor(Math.random() * 100000);
  return `INV-${datePart}-${randomPart}`;
};
