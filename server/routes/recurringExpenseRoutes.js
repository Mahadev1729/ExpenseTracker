const express = require("express");
const router = express.Router();
const recurringExpenseController = require("../controllers/recurringExpenseController");
const authMiddleware = require("../middleware/authMiddleware");

router.use(authMiddleware);

router.get("/", recurringExpenseController.getRecurringExpenses);
router.post("/", recurringExpenseController.addRecurringExpense);
router.put("/:id", recurringExpenseController.updateRecurringExpense);
router.delete("/:id", recurringExpenseController.deleteRecurringExpense);
router.post("/process", recurringExpenseController.processRecurringExpenses);

module.exports = router;
