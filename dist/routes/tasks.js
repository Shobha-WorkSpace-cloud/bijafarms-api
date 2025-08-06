"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.importTasks = exports.backupTasks = exports.bulkDeleteTasks = exports.deleteTask = exports.updateTask = exports.addTask = exports.getTasks = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const TASKS_FILE = path_1.default.join(process.cwd(), "src/data/TaskTracker.json");
// Ensure data directory exists
const dataDir = path_1.default.dirname(TASKS_FILE);
if (!fs_1.default.existsSync(dataDir)) {
    fs_1.default.mkdirSync(dataDir, { recursive: true });
}
// Helper function to read tasks from JSON file
const readTasks = () => {
    try {
        if (!fs_1.default.existsSync(TASKS_FILE)) {
            return [];
        }
        const data = fs_1.default.readFileSync(TASKS_FILE, "utf8");
        return JSON.parse(data);
    }
    catch (error) {
        console.error("Error reading tasks:", error);
        return [];
    }
};
// Helper function to write tasks to JSON file
const writeTasks = (tasks) => {
    try {
        fs_1.default.writeFileSync(TASKS_FILE, JSON.stringify(tasks, null, 2));
    }
    catch (error) {
        console.error("Error writing tasks:", error);
        throw error;
    }
};
// GET /api/tasks - Get all tasks
const getTasks = (req, res) => {
    try {
        const tasks = readTasks();
        res.json(tasks);
    }
    catch (error) {
        console.error("Error getting tasks:", error);
        res.status(500).json({ error: "Failed to fetch tasks" });
    }
};
exports.getTasks = getTasks;
// POST /api/tasks - Add new task
const addTask = (req, res) => {
    try {
        const newTask = req.body;
        // Validate required fields
        if (!newTask.title || !newTask.dueDate || !newTask.assignedTo) {
            return res.status(400).json({ error: "Missing required fields" });
        }
        // Generate ID if not provided
        if (!newTask.id) {
            newTask.id = Date.now().toString();
        }
        // Set default values
        newTask.status = newTask.status || "pending";
        newTask.createdAt =
            newTask.createdAt || new Date().toISOString().split("T")[0];
        newTask.reminderSent = false;
        const tasks = readTasks();
        tasks.unshift(newTask); // Add to beginning of array
        writeTasks(tasks);
        res.status(201).json(newTask);
    }
    catch (error) {
        console.error("Error adding task:", error);
        res.status(500).json({ error: "Failed to add task" });
    }
};
exports.addTask = addTask;
// PUT /api/tasks/:id - Update existing task
const updateTask = (req, res) => {
    try {
        const { id } = req.params;
        const updatedTask = req.body;
        const tasks = readTasks();
        const index = tasks.findIndex((task) => task.id === id);
        if (index === -1) {
            return res.status(404).json({ error: "Task not found" });
        }
        // If status is being changed to completed, set completedAt
        if (updatedTask.status === "completed" &&
            tasks[index].status !== "completed") {
            updatedTask.completedAt = new Date().toISOString().split("T")[0];
        }
        tasks[index] = { ...tasks[index], ...updatedTask, id };
        writeTasks(tasks);
        res.json(tasks[index]);
    }
    catch (error) {
        console.error("Error updating task:", error);
        res.status(500).json({ error: "Failed to update task" });
    }
};
exports.updateTask = updateTask;
// DELETE /api/tasks/:id - Delete task
const deleteTask = (req, res) => {
    try {
        const { id } = req.params;
        const tasks = readTasks();
        const index = tasks.findIndex((task) => task.id === id);
        if (index === -1) {
            return res.status(404).json({ error: "Task not found" });
        }
        const deletedTask = tasks.splice(index, 1)[0];
        writeTasks(tasks);
        res.json({
            message: "Task deleted successfully",
            deletedTask: deletedTask,
        });
    }
    catch (error) {
        console.error("Error deleting task:", error);
        res.status(500).json({ error: "Failed to delete task" });
    }
};
exports.deleteTask = deleteTask;
// POST /api/tasks/bulk-delete - Delete multiple tasks
const bulkDeleteTasks = (req, res) => {
    try {
        const { ids } = req.body;
        if (!Array.isArray(ids)) {
            return res.status(400).json({ error: "Expected array of IDs" });
        }
        const tasks = readTasks();
        const filteredTasks = tasks.filter((task) => !ids.includes(task.id));
        writeTasks(filteredTasks);
        res.json({
            message: "Tasks deleted successfully",
            deletedCount: tasks.length - filteredTasks.length,
        });
    }
    catch (error) {
        console.error("Error bulk deleting tasks:", error);
        res.status(500).json({ error: "Failed to delete tasks" });
    }
};
exports.bulkDeleteTasks = bulkDeleteTasks;
// GET /api/tasks/backup - Create backup of tasks
const backupTasks = (req, res) => {
    try {
        const tasks = readTasks();
        const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
        const backupFileName = `tasks-backup-${timestamp}.json`;
        res.setHeader("Content-Type", "application/json");
        res.setHeader("Content-Disposition", `attachment; filename="${backupFileName}"`);
        res.json(tasks);
    }
    catch (error) {
        console.error("Error creating backup:", error);
        res.status(500).json({ error: "Failed to create backup" });
    }
};
exports.backupTasks = backupTasks;
// POST /api/tasks/import - Import multiple tasks
const importTasks = (req, res) => {
    try {
        const importedTasks = req.body;
        if (!Array.isArray(importedTasks)) {
            return res.status(400).json({ error: "Expected array of tasks" });
        }
        const tasks = readTasks();
        // Add imported tasks to the beginning
        const updatedTasks = [...importedTasks, ...tasks];
        writeTasks(updatedTasks);
        res.json({
            message: "Tasks imported successfully",
            count: importedTasks.length,
        });
    }
    catch (error) {
        console.error("Error importing tasks:", error);
        res.status(500).json({ error: "Failed to import tasks" });
    }
};
exports.importTasks = importTasks;
//# sourceMappingURL=tasks.js.map