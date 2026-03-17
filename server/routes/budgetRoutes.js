const express = require("express");
const router = express.Router();
const budgetController = require("../controllers/budgetController");
const authMiddleware = require("../middleware/authMiddleware");

router.use(authMiddleware);

router.get("/", budgetController.getBudgets);
router.get("/progress", budgetController.getBudgetProgress);
router.post("/", budgetController.addBudget);
router.put("/:id", budgetController.updateBudget);
router.delete("/:id", budgetController.deleteBudget);

module.exports = router;
