export function aggregateTransactions(transactions: any[]) {
  return {
    count: transactions.length,
    totalAmount: transactions.reduce((sum, t) => sum + t.amount, 0),
  };
}
