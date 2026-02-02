// Convert dollars to cents
export const cents = (amount) => Math.round(Number(amount) * 100);

// Correct payout calculation
export const calculatePayoutAmounts = (totalAmount, commissionRate = 15, gstRate = 10) => {
  const adminCommission = (totalAmount * commissionRate) / 100;
  const gstAmount = (adminCommission * gstRate) / 100;

  // Correct payout
  const cleanerAmount = totalAmount - adminCommission - gstAmount;

  const round = (value) => Math.round(value * 100) / 100;

  return {
    adminCommission: round(adminCommission),
    gstAmount: round(gstAmount),
    totalFee: round(adminCommission + gstAmount),
    cleanerAmount: round(cleanerAmount),
    totalAmount: round(totalAmount)
  };
};
