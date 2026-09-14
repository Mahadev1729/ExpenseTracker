import { generateFinancialReportPDF } from "./reportGenerator";

export const generateExpensePDF = (expenses, categories = []) => {
  return generateFinancialReportPDF({
    expenses,
    categories,
    periodLabel: "Filtered Expense Report",
    currency: "$",
  });
};

export default generateExpensePDF;
