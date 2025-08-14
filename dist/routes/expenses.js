"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.populateCategories = exports.saveCategories = exports.getCategories = exports.backupExpenses = exports.bulkDeleteExpenses = exports.importExpenses = exports.deleteExpense = exports.updateExpense = exports.addExpense = exports.getExpenses = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const supabaseClient_1 = __importDefault(require("./supabaseClient"));
// Ensure data directory exists
const EXPENSES_FILE = path_1.default.join(process.cwd(), "src/data/expenses.json");
const CATEGORIES_FILE = path_1.default.join(process.cwd(), "src/data/categories.json");
const dataDir = path_1.default.dirname(EXPENSES_FILE);
if (!fs_1.default.existsSync(dataDir)) {
    fs_1.default.mkdirSync(dataDir, { recursive: true });
}
const readExpenses = async () => {
    try {
        const { data: expenses, error } = await supabaseClient_1.default
            .from('allexpenses')
            .select('*');
        if (error) {
            console.error("Supabase error:", error);
            // Fallback to file if Supabase fails
            if (!fs_1.default.existsSync(EXPENSES_FILE))
                return [];
            const fileData = fs_1.default.readFileSync(EXPENSES_FILE, "utf8");
            return JSON.parse(fileData);
        }
        if (!expenses)
            return [];
        //return JSON.parse(JSON.stringify(expenses));
        // Transform the data to match the expected format and ensure unique IDs
        return expenses.map((item, index) => {
            // ...existing transformation code...
            let formattedDate = new Date().toISOString().split("T")[0];
            const dateStr = item.Date || item.date;
            if (dateStr) {
                try {
                    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
                        formattedDate = dateStr;
                    }
                    else {
                        const dateParts = dateStr.split("/");
                        if (dateParts.length === 3) {
                            const [month, day, year] = dateParts;
                            const paddedMonth = month.padStart(2, "0");
                            const paddedDay = day.padStart(2, "0");
                            formattedDate = `${year}-${paddedMonth}-${paddedDay}`;
                        }
                    }
                }
                catch (e) {
                    console.warn(`Invalid date format: ${dateStr}`);
                }
            }
            return {
                id: String(item.id || index + 1),
                date: formattedDate,
                type: item.Type || item.type || "Expense",
                description: item.Description || item.description || "No description",
                amount: parseFloat(item.Amount || item.amount || 0),
                paidBy: item["Paid By"] || item.paidBy || "Unknown",
                category: item.Category || item.category || "Other",
                subCategory: item["Sub-Category"] || item.subCategory || "General",
                source: item.Source || item.source || "Unknown",
                notes: item.Notes || item.notes || "",
            };
        });
    }
    catch (error) {
        console.error("Error reading expenses:", error);
        return [];
    }
};
// Helper function to write expenses to JSON file
const writeExpenses = (expenses) => {
    try {
        fs_1.default.writeFileSync(EXPENSES_FILE, JSON.stringify(expenses, null, 2));
    }
    catch (error) {
        console.error("Error writing expenses:", error);
        throw error;
    }
};
// Helper function to read categories from JSON file
const readCategories = () => {
    try {
        if (!fs_1.default.existsSync(CATEGORIES_FILE)) {
            return { categories: [], lastUpdated: new Date().toISOString() };
        }
        const data = fs_1.default.readFileSync(CATEGORIES_FILE, "utf8");
        return JSON.parse(data);
    }
    catch (error) {
        console.error("Error reading categories:", error);
        return { categories: [], lastUpdated: new Date().toISOString() };
    }
};
// Helper function to write categories to JSON file
const writeCategories = (data) => {
    try {
        fs_1.default.writeFileSync(CATEGORIES_FILE, JSON.stringify(data, null, 2));
    }
    catch (error) {
        console.error("Error writing categories:", error);
        throw error;
    }
};
// GET /api/expenses - Get all expenses
const getExpenses = async (req, res) => {
    try {
        const expenses = await readExpenses();
        res.json(expenses);
    }
    catch (error) {
        console.error("Error getting expenses:", error);
        res.status(500).json({ error: "Failed to fetch expenses" });
    }
};
exports.getExpenses = getExpenses;
// POST /api/expenses - Add new expense
const addExpense = async (req, res) => {
    try {
        const newExpense = req.body;
        // Validate required fields
        if (!newExpense.description || !newExpense.amount || !newExpense.category) {
            return res.status(400).json({ error: "Missing required fields" });
        }
        // Generate auto-increment integer ID
        const expenses = await readExpenses();
        let maxId = 0;
        // Find the highest existing ID
        expenses.forEach((expense) => {
            const numId = parseInt(expense.id);
            if (!isNaN(numId) && numId > maxId) {
                maxId = numId;
            }
        });
        // Set new ID as next integer
        newExpense.id = (maxId + 1).toString();
        expenses.unshift(newExpense); // Add to beginning of array
        writeExpenses(expenses);
        res.status(201).json(newExpense);
    }
    catch (error) {
        console.error("Error adding expense:", error);
        res.status(500).json({ error: "Failed to add expense" });
    }
};
exports.addExpense = addExpense;
// PUT /api/expenses/:id - Update existing expense
const updateExpense = async (req, res) => {
    try {
        const { id } = req.params;
        const updatedExpense = req.body;
        const expenses = await readExpenses();
        const index = expenses.findIndex((expense) => expense.id === id);
        if (index === -1) {
            return res.status(404).json({ error: "Expense not found" });
        }
        expenses[index] = { ...expenses[index], ...updatedExpense, id };
        writeExpenses(expenses);
        res.json(expenses[index]);
    }
    catch (error) {
        console.error("Error updating expense:", error);
        res.status(500).json({ error: "Failed to update expense" });
    }
};
exports.updateExpense = updateExpense;
// DELETE /api/expenses/:id - Delete expense
const deleteExpense = async (req, res) => {
    try {
        const { id } = req.params;
        const expenses = await readExpenses();
        const index = expenses.findIndex((expense) => expense.id === id);
        if (index === -1) {
            return res.status(404).json({ error: "Expense not found" });
        }
        expenses.splice(index, 1);
        writeExpenses(expenses);
        res.json({ message: "Expense deleted successfully" });
    }
    catch (error) {
        console.error("Error deleting expense:", error);
        res.status(500).json({ error: "Failed to delete expense" });
    }
};
exports.deleteExpense = deleteExpense;
// POST /api/expenses/import - Import multiple expenses
const importExpenses = async (req, res) => {
    try {
        const importedExpenses = req.body;
        if (!Array.isArray(importedExpenses)) {
            return res.status(400).json({ error: "Expected array of expenses" });
        }
        const expenses = await readExpenses();
        // Add imported expenses to the beginning
        const updatedExpenses = [...importedExpenses, ...expenses];
        writeExpenses(updatedExpenses);
        res.json({
            message: "Expenses imported successfully",
            count: importedExpenses.length,
        });
    }
    catch (error) {
        console.error("Error importing expenses:", error);
        res.status(500).json({ error: "Failed to import expenses" });
    }
};
exports.importExpenses = importExpenses;
// POST /api/expenses/bulk-delete - Delete multiple expenses
const bulkDeleteExpenses = async (req, res) => {
    try {
        const { ids } = req.body;
        if (!Array.isArray(ids)) {
            return res.status(400).json({ error: "Expected array of IDs" });
        }
        const expenses = await readExpenses();
        const filteredExpenses = expenses.filter((expense) => !ids.includes(expense.id));
        writeExpenses(filteredExpenses);
        res.json({
            message: "Expenses deleted successfully",
            deletedCount: expenses.length - filteredExpenses.length,
        });
    }
    catch (error) {
        console.error("Error bulk deleting expenses:", error);
        res.status(500).json({ error: "Failed to delete expenses" });
    }
};
exports.bulkDeleteExpenses = bulkDeleteExpenses;
// GET /api/expenses/backup - Create backup of expenses
const backupExpenses = (req, res) => {
    try {
        const expenses = readExpenses();
        const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
        const backupFileName = `expenses-backup-${timestamp}.json`;
        res.setHeader("Content-Type", "application/json");
        res.setHeader("Content-Disposition", `attachment; filename="${backupFileName}"`);
        res.json(expenses);
    }
    catch (error) {
        console.error("Error creating backup:", error);
        res.status(500).json({ error: "Failed to create backup" });
    }
};
exports.backupExpenses = backupExpenses;
// GET /api/expenses/categories - Get categories
const getCategories = (req, res) => {
    try {
        const categories = readCategories();
        res.json(categories);
    }
    catch (error) {
        console.error("Error getting categories:", error);
        res.status(500).json({ error: "Failed to fetch categories" });
    }
};
exports.getCategories = getCategories;
// POST /api/expenses/categories - Save categories
const saveCategories = (req, res) => {
    try {
        const categoryData = req.body;
        // Validate required fields
        if (!categoryData.categories || !Array.isArray(categoryData.categories)) {
            return res.status(400).json({ error: "Invalid categories data" });
        }
        writeCategories(categoryData);
        res.json({ message: "Categories saved successfully" });
    }
    catch (error) {
        console.error("Error saving categories:", error);
        res.status(500).json({ error: "Failed to save categories" });
    }
};
exports.saveCategories = saveCategories;
// POST /api/expenses/populate-categories - Populate categories from existing expense data
const populateCategories = async (req, res) => {
    try {
        const expenses = await readExpenses();
        const categoryMap = {};
        // Extract categories and sub-categories from existing expenses
        expenses.forEach((expense) => {
            if (expense.category && expense.category.trim() !== "") {
                const category = expense.category.trim();
                const subCategory = expense.subCategory
                    ? expense.subCategory.trim()
                    : "General";
                if (!categoryMap[category]) {
                    categoryMap[category] = new Set();
                }
                if (subCategory && subCategory !== "") {
                    categoryMap[category].add(subCategory);
                }
            }
        });
        // Convert to CategoryConfig format
        const categories = Object.entries(categoryMap).map(([categoryName, subCategoriesSet], index) => {
            // Clean up and deduplicate sub-categories
            const subCategories = Array.from(subCategoriesSet)
                .filter((sub) => sub && sub.trim() !== "")
                .map((sub) => {
                // Standardize common variations
                if (sub.toLowerCase() === "misc")
                    return "Misc";
                if (sub.toLowerCase() === "plubming")
                    return "Plumbing";
                if (sub.toLowerCase() === "solar")
                    return "Solar";
                if (sub.toLowerCase() === "doors")
                    return "Doors";
                if (sub.toLowerCase() === "electric")
                    return "Electric";
                return sub;
            })
                .filter((sub, idx, arr) => arr.findIndex((s) => s.toLowerCase() === sub.toLowerCase()) ===
                idx) // Remove duplicates
                .sort(); // Sort alphabetically
            return {
                id: (Date.now() + index).toString(),
                name: categoryName,
                subCategories: subCategories.length > 0 ? subCategories : ["General"],
                createdAt: new Date().toISOString(),
            };
        });
        // Sort categories alphabetically
        categories.sort((a, b) => a.name.localeCompare(b.name));
        const categoryData = {
            categories,
            lastUpdated: new Date().toISOString(),
        };
        writeCategories(categoryData);
        res.json({
            message: "Categories populated successfully",
            count: categories.length,
            categories: categoryData,
        });
    }
    catch (error) {
        console.error("Error populating categories:", error);
        res.status(500).json({ error: "Failed to populate categories" });
    }
};
exports.populateCategories = populateCategories;
//# sourceMappingURL=expenses.js.map