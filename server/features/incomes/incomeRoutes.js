const express = require("express");
const router = express.Router();
const incomeController = require("./incomeController");
const authMiddleware = require("../../middleware/authMiddleware");

router.use(authMiddleware);

router.get("/", incomeController.getIncomes);
router.post("/", incomeController.addIncome);
router.put("/:id", incomeController.updateIncome);
router.delete("/:id", incomeController.deleteIncome);

module.exports = router;
