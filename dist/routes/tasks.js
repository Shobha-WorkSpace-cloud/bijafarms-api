"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.importTasks = exports.backupTasks = exports.bulkDeleteTasks = exports.deleteTask = exports.updateTask = exports.addTask = exports.getTasks = void 0;
const supabaseClient_1 = __importDefault(require("./supabaseClient"));
// Helper function to read tasks from Supabase
const readTasks = async () => {
    try {
        const { data: tasks, error } = await supabaseClient_1.default
            .from('tasks')
            .select('*')
            .order('id', { ascending: false });
        if (error) {
            console.error("Supabase error:", error);
            return [];
        }
        return tasks?.map(task => ({
            id: task.id.toString(),
            title: task.title,
            description: task.description,
            category: task.category,
            taskType: task.taskType,
            priority: task.priority,
            status: task.status,
            dueDate: task.dueDate,
            assignedTo: task.assignedTo,
            notes: task.notes,
            reminderSent: task.reminderSent,
            completedAt: task.completedAt,
            createdAt: task.createdAt
        })) || [];
    }
    catch (error) {
        console.error("Error reading tasks:", error);
        return [];
    }
};
// GET /api/tasks - Get all tasks
const getTasks = async (req, res) => {
    try {
        const tasks = await readTasks();
        res.json(tasks);
    }
    catch (error) {
        console.error("Error getting tasks:", error);
        res.status(500).json({ error: "Failed to fetch tasks" });
    }
};
exports.getTasks = getTasks;
// POST /api/tasks - Add new task
const addTask = async (req, res) => {
    try {
        const newTask = req.body;
        // Validate required fields
        if (!newTask.title || !newTask.dueDate || !newTask.assignedTo) {
            return res.status(400).json({ error: "Missing required fields" });
        }
        // Prepare task data for Supabase
        const taskData = {
            title: newTask.title,
            description: newTask.description,
            category: newTask.category,
            taskType: newTask.taskType,
            priority: newTask.priority || "medium",
            status: newTask.status || "pending",
            dueDate: newTask.dueDate,
            assignedTo: newTask.assignedTo,
            notes: newTask.notes,
            reminderSent: false
        };
        const { data, error } = await supabaseClient_1.default
            .from('tasks')
            .insert([taskData])
            .select()
            .single();
        if (error) {
            console.error("Supabase insert error:", error);
            throw error;
        }
        // Transform back to expected format
        const returnTask = {
            id: data.id.toString(),
            title: data.title,
            description: data.description,
            category: data.category,
            taskType: data.taskType,
            priority: data.priority,
            status: data.status,
            dueDate: data.dueDate,
            assignedTo: data.assignedTo,
            notes: data.notes,
            reminderSent: data.reminderSent,
            completedAt: data.completedAt,
            createdAt: data.createdAt
        };
        res.status(201).json(returnTask);
    }
    catch (error) {
        console.error("Error adding task:", error);
        res.status(500).json({ error: "Failed to add task" });
    }
};
exports.addTask = addTask;
// PUT /api/tasks/:id - Update existing task
const updateTask = async (req, res) => {
    try {
        const { id } = req.params;
        const updatedTask = req.body;
        // Prepare update data
        const updateData = {
            title: updatedTask.title,
            description: updatedTask.description,
            category: updatedTask.category,
            taskType: updatedTask.taskType,
            priority: updatedTask.priority,
            status: updatedTask.status,
            dueDate: updatedTask.dueDate,
            assignedTo: updatedTask.assignedTo,
            notes: updatedTask.notes,
            reminderSent: updatedTask.reminderSent
        };
        // If status is being changed to completed, set completedAt
        if (updatedTask.status === "completed") {
            updateData.completedAt = new Date().toISOString().split("T")[0];
        }
        const { data, error } = await supabaseClient_1.default
            .from('tasks')
            .update(updateData)
            .eq('id', parseInt(id))
            .select()
            .single();
        if (error) {
            if (error.code === 'PGRST116') {
                return res.status(404).json({ error: "Task not found" });
            }
            console.error("Supabase update error:", error);
            throw error;
        }
        // Transform back to expected format
        const returnTask = {
            id: data.id.toString(),
            title: data.title,
            description: data.description,
            category: data.category,
            taskType: data.taskType,
            priority: data.priority,
            status: data.status,
            dueDate: data.dueDate,
            assignedTo: data.assignedTo,
            notes: data.notes,
            reminderSent: data.reminderSent,
            completedAt: data.completedAt,
            createdAt: data.createdAt
        };
        res.json(returnTask);
    }
    catch (error) {
        console.error("Error updating task:", error);
        res.status(500).json({ error: "Failed to update task" });
    }
};
exports.updateTask = updateTask;
// DELETE /api/tasks/:id - Delete task
const deleteTask = async (req, res) => {
    try {
        const { id } = req.params;
        const { data, error } = await supabaseClient_1.default
            .from('tasks')
            .delete()
            .eq('id', parseInt(id))
            .select()
            .single();
        if (error) {
            if (error.code === 'PGRST116') {
                return res.status(404).json({ error: "Task not found" });
            }
            console.error("Supabase delete error:", error);
            throw error;
        }
        // Transform deleted task to expected format
        const deletedTask = {
            id: data.id.toString(),
            title: data.title,
            description: data.description,
            category: data.category,
            taskType: data.taskType,
            priority: data.priority,
            status: data.status,
            dueDate: data.dueDate,
            assignedTo: data.assignedTo,
            notes: data.notes,
            reminderSent: data.reminderSent,
            completedAt: data.completedAt,
            createdAt: data.createdAt
        };
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
const bulkDeleteTasks = async (req, res) => {
    try {
        const { ids } = req.body;
        if (!Array.isArray(ids)) {
            return res.status(400).json({ error: "Expected array of IDs" });
        }
        // Convert string IDs to integers
        const numericIds = ids.map(id => parseInt(id));
        const { data, error } = await supabaseClient_1.default
            .from('tasks')
            .delete()
            .in('id', numericIds)
            .select();
        if (error) {
            console.error("Supabase bulk delete error:", error);
            throw error;
        }
        res.json({
            message: "Tasks deleted successfully",
            deletedCount: data?.length || 0,
        });
    }
    catch (error) {
        console.error("Error bulk deleting tasks:", error);
        res.status(500).json({ error: "Failed to delete tasks" });
    }
};
exports.bulkDeleteTasks = bulkDeleteTasks;
// GET /api/tasks/backup - Create backup of tasks
const backupTasks = async (req, res) => {
    try {
        const tasks = await readTasks();
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
const importTasks = async (req, res) => {
    try {
        const importedTasks = req.body;
        if (!Array.isArray(importedTasks)) {
            return res.status(400).json({ error: "Expected array of tasks" });
        }
        // Prepare tasks data for Supabase
        const tasksData = importedTasks.map(task => ({
            title: task.title,
            description: task.description,
            category: task.category,
            taskType: task.taskType,
            priority: task.priority || "medium",
            status: task.status || "pending",
            dueDate: task.dueDate,
            assignedTo: task.assignedTo,
            notes: task.notes,
            reminderSent: task.reminderSent || false,
            completedAt: task.completedAt
        }));
        const { data, error } = await supabaseClient_1.default
            .from('tasks')
            .insert(tasksData)
            .select();
        if (error) {
            console.error("Supabase import error:", error);
            throw error;
        }
        res.json({
            message: "Tasks imported successfully",
            count: data?.length || 0,
        });
    }
    catch (error) {
        console.error("Error importing tasks:", error);
        res.status(500).json({ error: "Failed to import tasks" });
    }
};
exports.importTasks = importTasks;
//# sourceMappingURL=tasks.js.map