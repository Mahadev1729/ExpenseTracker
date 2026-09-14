import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

// Helper to call autoTable safely across different module bundler versions
const runAutoTable = (doc, options) => {
  if (typeof doc.autoTable === "function") {
    doc.autoTable(options);
  } else if (typeof autoTable === "function") {
    autoTable(doc, options);
  } else if (autoTable && typeof autoTable.default === "function") {
    autoTable.default(doc, options);
  }
};

/**
 * Generates an executive-grade, branded Financial Statement & Monthly Digest PDF
 */
export const generateFinancialReportPDF = ({
  expenses = [],
  incomes = [],
  budgets = [],
  categories = [],
  user = null,
  periodLabel = "Custom Period",
  startDate = "",
  endDate = "",
  currency = "$",
}) => {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;

  // Colors
  const gold = [201, 162, 39];
  const darkNavy = [15, 23, 42];
  const textDark = [30, 41, 59];
  const textMuted = [100, 116, 139];
  const emeraldGreen = [16, 185, 129];
  const crimsonRed = [239, 68, 68];

  // Calculations
  const totalIncome = incomes.reduce((sum, item) => sum + parseFloat(item.amount || 0), 0);
  const totalExpenses = expenses.reduce((sum, item) => sum + parseFloat(item.amount || 0), 0);
  const netSavings = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? ((netSavings / totalIncome) * 100).toFixed(1) : 0;

  // 1. BRAND HEADER
  doc.setFillColor(...darkNavy);
  doc.rect(0, 0, pageWidth, 42, "F");

  // Gold accent bar
  doc.setFillColor(...gold);
  doc.rect(0, 41, pageWidth, 2, "F");

  // Title & Subtitle
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(255, 255, 255);
  doc.text("SMART EXPENSE TRACKER", margin, 18);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(203, 213, 225);
  doc.text("Financial Statement & Monthly Digest", margin, 26);

  // Period Badge
  doc.setFontSize(9);
  doc.setTextColor(...gold);
  doc.text(`STATEMENT PERIOD: ${periodLabel.toUpperCase()}`, margin, 34);

  // User Profile / Metadata on Top Right
  doc.setFontSize(9);
  doc.setTextColor(241, 245, 249);
  const userName = user?.name || "Valued Member";
  const userEmail = user?.email || "";
  doc.text(userName, pageWidth - margin, 18, { align: "right" });
  doc.setTextColor(148, 163, 184);
  doc.text(userEmail, pageWidth - margin, 25, { align: "right" });
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, pageWidth - margin, 32, { align: "right" });

  let currentY = 52;

  // 2. EXECUTIVE FINANCIAL SUMMARY BOXES
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(...textDark);
  doc.text("Executive Cash Flow Summary", margin, currentY);
  currentY += 5;

  const cardWidth = (pageWidth - margin * 2 - 9) / 4;
  const cardHeight = 22;

  const metrics = [
    {
      label: "TOTAL INFLOWS",
      value: `+${currency}${totalIncome.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      color: emeraldGreen,
    },
    {
      label: "TOTAL OUTFLOWS",
      value: `-${currency}${totalExpenses.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      color: crimsonRed,
    },
    {
      label: "NET SAVINGS",
      value: `${netSavings >= 0 ? "+" : "-"}${currency}${Math.abs(netSavings).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      color: netSavings >= 0 ? emeraldGreen : crimsonRed,
    },
    {
      label: "SAVINGS RATE",
      value: `${savingsRate}%`,
      color: gold,
    },
  ];

  metrics.forEach((m, idx) => {
    const xPos = margin + idx * (cardWidth + 3);
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(xPos, currentY, cardWidth, cardHeight, 2, 2, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(...textMuted);
    doc.text(m.label, xPos + 4, currentY + 7);

    doc.setFontSize(11);
    doc.setTextColor(...m.color);
    doc.text(m.value, xPos + 4, currentY + 16);
  });

  currentY += cardHeight + 10;

  // 3. CATEGORY SPENDING BREAKDOWN
  const categoryMap = {};
  expenses.forEach((item) => {
    const catName = item.category || "Uncategorized";
    if (!categoryMap[catName]) {
      categoryMap[catName] = { count: 0, total: 0 };
    }
    categoryMap[catName].count += 1;
    categoryMap[catName].total += parseFloat(item.amount || 0);
  });

  const categoryRows = Object.entries(categoryMap)
    .sort((a, b) => b[1].total - a[1].total)
    .map(([cat, data], idx) => {
      const share = totalExpenses > 0 ? ((data.total / totalExpenses) * 100).toFixed(1) : "0.0";
      return [
        `#${idx + 1}`,
        cat,
        data.count.toString(),
        `${currency}${data.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        `${share}%`,
      ];
    });

  if (categoryRows.length > 0) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(...textDark);
    doc.text("Top Expense Categories", margin, currentY);
    currentY += 3;

    runAutoTable(doc, {
      startY: currentY,
      head: [["Rank", "Category", "Transactions", "Total Spent", "% Share"]],
      body: categoryRows,
      theme: "striped",
      styles: {
        fontSize: 8.5,
        cellPadding: 2.5,
        textColor: textDark,
      },
      headStyles: {
        fillColor: darkNavy,
        textColor: 255,
        fontStyle: "bold",
        halign: "left",
      },
      columnStyles: {
        0: { cellWidth: 16, halign: "center" },
        1: { cellWidth: 50 },
        2: { cellWidth: 26, halign: "center" },
        3: { cellWidth: 40, halign: "right" },
        4: { cellWidth: 25, halign: "right" },
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },
      margin: { left: margin, right: margin },
    });

    currentY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 9 : currentY + 30;
  }

  // 4. BUDGET ADHERENCE PERFORMANCE (If budgets are available)
  if (budgets && budgets.length > 0) {
    // Check page overflow
    if (currentY > pageHeight - 65) {
      doc.addPage();
      currentY = 20;
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(...textDark);
    doc.text("Budget Adherence & Performance", margin, currentY);
    currentY += 3;

    const budgetRows = budgets.map((b) => {
      const spent = parseFloat(b.spent_amount || 0);
      const limit = parseFloat(b.amount || 0);
      const pct = limit > 0 ? ((spent / limit) * 100).toFixed(0) : 0;
      const status = pct >= 100 ? "EXCEEDED" : pct >= 80 ? "WARNING" : "ON TRACK";
      const remaining = limit - spent;

      return [
        b.category_name || "General",
        `${currency}${limit.toFixed(2)}`,
        `${currency}${spent.toFixed(2)}`,
        `${remaining >= 0 ? "" : "-"}${currency}${Math.abs(remaining).toFixed(2)}`,
        `${pct}%`,
        status,
      ];
    });

    runAutoTable(doc, {
      startY: currentY,
      head: [["Category Budget", "Allocated Limit", "Actual Spent", "Remaining", "Used %", "Status"]],
      body: budgetRows,
      theme: "grid",
      styles: {
        fontSize: 8.5,
        cellPadding: 2.5,
        textColor: textDark,
      },
      headStyles: {
        fillColor: [30, 41, 59],
        textColor: 255,
        fontStyle: "bold",
      },
      columnStyles: {
        0: { cellWidth: 45 },
        1: { cellWidth: 28, halign: "right" },
        2: { cellWidth: 28, halign: "right" },
        3: { cellWidth: 28, halign: "right" },
        4: { cellWidth: 22, halign: "center" },
        5: { cellWidth: 28, halign: "center" },
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },
      margin: { left: margin, right: margin },
    });

    currentY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 9 : currentY + 30;
  }

  // 5. ITEMIZED TRANSACTION LEDGER (Combined Incomes & Expenses sorted chronologically)
  if (currentY > pageHeight - 55) {
    doc.addPage();
    currentY = 20;
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...textDark);
  doc.text("Itemized Transaction Ledger", margin, currentY);
  currentY += 3;

  const combinedTransactions = [
    ...expenses.map((e) => ({
      date: e.date,
      type: "Expense",
      title: e.title || "Expense",
      category: e.category || "General",
      amount: -parseFloat(e.amount || 0),
      notes: e.notes || "",
    })),
    ...incomes.map((i) => ({
      date: i.date,
      type: "Income",
      title: i.source || i.title || "Income",
      category: i.category || "Income",
      amount: parseFloat(i.amount || 0),
      notes: i.notes || "",
    })),
  ].sort((a, b) => new Date(b.date) - new Date(a.date));

  const ledgerRows = combinedTransactions.map((tx) => [
    new Date(tx.date).toLocaleDateString(),
    tx.type,
    tx.title,
    tx.category,
    `${tx.amount >= 0 ? "+" : "-"}${currency}${Math.abs(tx.amount).toFixed(2)}`,
    tx.notes,
  ]);

  runAutoTable(doc, {
    startY: currentY,
    head: [["Date", "Type", "Title / Source", "Category", "Amount", "Notes"]],
    body: ledgerRows.length > 0 ? ledgerRows : [["-", "-", "No transactions found", "-", "-", "-"]],
    theme: "striped",
    styles: {
      fontSize: 8,
      cellPadding: 2,
      textColor: textDark,
    },
    headStyles: {
      fillColor: darkNavy,
      textColor: 255,
      fontStyle: "bold",
    },
    columnStyles: {
      0: { cellWidth: 24 },
      1: { cellWidth: 20 },
      2: { cellWidth: 42 },
      3: { cellWidth: 32 },
      4: { cellWidth: 26, halign: "right" },
      5: { cellWidth: "auto" },
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    margin: { left: margin, right: margin },
  });

  // 6. FOOTER WITH PAGINATION
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...textMuted);
    doc.text(
      `Confidential • Smart Expense Tracker • Page ${i} of ${totalPages}`,
      pageWidth / 2,
      pageHeight - 8,
      { align: "center" }
    );
  }

  // Save the PDF
  const sanitizedPeriod = periodLabel.toLowerCase().replace(/[^a-z0-9]/g, "_");
  const filename = `Financial_Statement_${sanitizedPeriod}_${new Date().toISOString().split("T")[0]}.pdf`;
  doc.save(filename);
};

/**
 * Exports transaction list to an RFC-compliant CSV with UTF-8 BOM for Microsoft Excel compatibility
 */
export const exportToCSV = ({
  expenses = [],
  incomes = [],
  mode = "all", // "all" | "expenses" | "incomes"
  filename = "financial_statement.csv",
}) => {
  const transactions = [];

  if (mode === "all" || mode === "expenses") {
    expenses.forEach((e) => {
      transactions.push({
        date: e.date ? new Date(e.date).toISOString().split("T")[0] : "",
        type: "Expense",
        title: e.title || "Expense",
        category: e.category || "General",
        amount: -Math.abs(parseFloat(e.amount || 0)),
        notes: e.notes || "",
      });
    });
  }

  if (mode === "all" || mode === "incomes") {
    incomes.forEach((i) => {
      transactions.push({
        date: i.date ? new Date(i.date).toISOString().split("T")[0] : "",
        type: "Income",
        title: i.source || i.title || "Income",
        category: i.category || "Income",
        amount: Math.abs(parseFloat(i.amount || 0)),
        notes: i.notes || "",
      });
    });
  }

  // Sort chronological descending
  transactions.sort((a, b) => new Date(b.date) - new Date(a.date));

  // CSV formatting with quotes & comma escape
  const escapeCsv = (val) => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const headers = ["Date", "Type", "Title / Source", "Category", "Amount", "Notes"];
  const rows = transactions.map((t) => [
    escapeCsv(t.date),
    escapeCsv(t.type),
    escapeCsv(t.title),
    escapeCsv(t.category),
    t.amount.toFixed(2),
    escapeCsv(t.notes),
  ]);

  const csvContent = "\uFEFF" + [headers.join(","), ...rows.map((r) => r.join(","))].join("\r\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });

  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename.endsWith(".csv") ? filename : `${filename}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

/**
 * Exports data to JSON
 */
export const exportToJSON = ({ data, filename = "financial_export.json" }) => {
  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: "application/json" });

  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename.endsWith(".json") ? filename : `${filename}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};
