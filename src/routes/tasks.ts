import { RequestHandler } from "express";
import supabase from './supabaseClient';

interface Task {
  id: string;
  title: string;
  description: string;
  category: string;
  taskType: string;
  priority: "low" | "medium" | "high";
  status: "pending" | "in-progress" | "completed";
  dueDate: string;
  assignedTo: string;
  notes: string;
  createdAt: string;
  completedAt?: string;
  reminderSent?: boolean;
}

// Helper function to read tasks from Supabase
const readTasks = async (): Promise<Task[]> => {
  try {
    const { data: tasks, error } = await supabase
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
      taskType: task.task_type,
      priority: task.priority,
      status: task.status,
      dueDate: task.due_date,
      assignedTo: task.assigned_to,
      notes: task.notes,
      reminderSent: task.reminder_sent,
      completedAt: task.completed_at,
      createdAt: task.created_at
    })) || [];
  } catch (error) {
    console.error("Error reading tasks:", error);
    return [];
  }
};

// GET /api/tasks - Get all tasks
export const getTasks: RequestHandler = async (req, res) => {
  try {
    const tasks = await readTasks();
    res.json(tasks);
  } catch (error) {
    console.error("Error getting tasks:", error);
    res.status(500).json({ error: "Failed to fetch tasks" });
  }
};

// POST /api/tasks - Add new task
export const addTask: RequestHandler = (req, res) => {
  try {
    const newTask: Task = req.body;

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
  } catch (error) {
    console.error("Error adding task:", error);
    res.status(500).json({ error: "Failed to add task" });
  }
};

// PUT /api/tasks/:id - Update existing task
export const updateTask: RequestHandler = (req, res) => {
  try {
    const { id } = req.params;
    const updatedTask: Task = req.body;

    const tasks = readTasks();
    const index = tasks.findIndex((task) => task.id === id);

    if (index === -1) {
      return res.status(404).json({ error: "Task not found" });
    }

    // If status is being changed to completed, set completedAt
    if (
      updatedTask.status === "completed" &&
      tasks[index].status !== "completed"
    ) {
      updatedTask.completedAt = new Date().toISOString().split("T")[0];
    }

    tasks[index] = { ...tasks[index], ...updatedTask, id };
    writeTasks(tasks);

    res.json(tasks[index]);
  } catch (error) {
    console.error("Error updating task:", error);
    res.status(500).json({ error: "Failed to update task" });
  }
};

// DELETE /api/tasks/:id - Delete task
export const deleteTask: RequestHandler = (req, res) => {
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
  } catch (error) {
    console.error("Error deleting task:", error);
    res.status(500).json({ error: "Failed to delete task" });
  }
};

// POST /api/tasks/bulk-delete - Delete multiple tasks
export const bulkDeleteTasks: RequestHandler = (req, res) => {
  try {
    const { ids }: { ids: string[] } = req.body;

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
  } catch (error) {
    console.error("Error bulk deleting tasks:", error);
    res.status(500).json({ error: "Failed to delete tasks" });
  }
};

// GET /api/tasks/backup - Create backup of tasks
export const backupTasks: RequestHandler = (req, res) => {
  try {
    const tasks = readTasks();
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const backupFileName = `tasks-backup-${timestamp}.json`;

    res.setHeader("Content-Type", "application/json");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${backupFileName}"`,
    );
    res.json(tasks);
  } catch (error) {
    console.error("Error creating backup:", error);
    res.status(500).json({ error: "Failed to create backup" });
  }
};

// POST /api/tasks/import - Import multiple tasks
export const importTasks: RequestHandler = (req, res) => {
  try {
    const importedTasks: Task[] = req.body;

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
  } catch (error) {
    console.error("Error importing tasks:", error);
    res.status(500).json({ error: "Failed to import tasks" });
  }
};
