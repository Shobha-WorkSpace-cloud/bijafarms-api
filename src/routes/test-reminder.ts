import { RequestHandler } from "express";
import fs from "fs";
import path from "path";
const TASKS_FILE = path.join(process.cwd(), "src/data/TaskTracker.json");

// Helper function to read tasks
const readTasks = () => {
  try {
    if (!fs.existsSync(TASKS_FILE)) {
      return [];
    }
    const data = fs.readFileSync(TASKS_FILE, "utf8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading tasks:", error);
    return [];
  }
};

// Helper function to write tasks
const writeTasks = (tasks: any[]) => {
  try {
    fs.writeFileSync(TASKS_FILE, JSON.stringify(tasks, null, 2));
  } catch (error) {
    console.error("Error writing tasks:", error);
    throw error;
  }
};

// POST /api/test-reminder-validation - Add test task for validation
export const createTestReminderTask: RequestHandler = (req, res) => {
  try {
    console.log("=== Creating Test Reminder Task ===");

    // Calculate tomorrow's date
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowDate = tomorrow.toISOString().split("T")[0];

    const testTask = {
      id: `test-${Date.now()}`,
      title: "🧪 TEST REMINDER - Goat Health Check",
      description:
        "This is a test task to validate WhatsApp reminder functionality. It should trigger a reminder today for tomorrow's due date.",
      category: "animal-health",
      taskType: "checkup",
      priority: "high",
      status: "pending",
      dueDate: tomorrowDate,
      assignedTo: "Test Farmer",
      notes:
        "TEST TASK: This validates that reminders are sent 1 day before due date.",
      createdAt: new Date().toISOString().split("T")[0],
      reminderSent: false,
    };

    const tasks = readTasks();
    tasks.unshift(testTask);
    writeTasks(tasks);

    console.log(`✅ Test task created with due date: ${tomorrowDate}`);
    console.log(`📅 Reminder should be triggered today for tomorrow's task`);

    res.json({
      success: true,
      message: "Test reminder task created successfully",
      testTask: testTask,
      reminderInfo: {
        taskDueDate: tomorrowDate,
        reminderShouldTrigger: "today",
        expectedBehavior:
          "WhatsApp reminder URL should be generated automatically",
      },
    });
  } catch (error) {
    console.error("Error creating test reminder task:", error);
    res.status(500).json({
      success: false,
      error: "Failed to create test reminder task",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// GET /api/test-reminder-validation - Check for test tasks and reminder status
export const checkReminderValidation: RequestHandler = (req, res) => {
  try {
    console.log("=== Checking Reminder Validation ===");

    const tasks = readTasks();
    const testTasks = tasks.filter((task: any) => task.id.startsWith("test-"));

    const today = new Date().toISOString().split("T")[0];
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowDate = tomorrow.toISOString().split("T")[0];

    const validationResults = testTasks.map((task: any) => {
      const daysDifference = Math.ceil(
        (new Date(task.dueDate).getTime() - new Date(today).getTime()) /
          (1000 * 60 * 60 * 24),
      );

      return {
        taskId: task.id,
        title: task.title,
        dueDate: task.dueDate,
        daysDifference: daysDifference,
        shouldTriggerReminder: daysDifference === 1,
        reminderSent: task.reminderSent || false,
        status: task.status,
      };
    });

    res.json({
      success: true,
      message: "Reminder validation check completed",
      today: today,
      tomorrow: tomorrowDate,
      testTasksFound: testTasks.length,
      validationResults: validationResults,
      summary: {
        tasksNeedingReminders: validationResults.filter(
          (r: any) => r.shouldTriggerReminder && !r.reminderSent,
        ).length,
        remindersSent: validationResults.filter((r: any) => r.reminderSent)
          .length,
      },
    });
  } catch (error) {
    console.error("Error checking reminder validation:", error);
    res.status(500).json({
      success: false,
      error: "Failed to check reminder validation",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// DELETE /api/test-reminder-validation - Clean up test tasks
export const cleanupTestTasks: RequestHandler = (req, res) => {
  try {
    console.log("=== Cleaning Up Test Tasks ===");

    const tasks = readTasks();
    const nonTestTasks = tasks.filter(
      (task: any) => !task.id.startsWith("test-"),
    );
    const deletedCount = tasks.length - nonTestTasks.length;

    writeTasks(nonTestTasks);

    console.log(`🗑️ Removed ${deletedCount} test tasks`);

    res.json({
      success: true,
      message: "Test tasks cleaned up successfully",
      deletedCount: deletedCount,
      remainingTasks: nonTestTasks.length,
    });
  } catch (error) {
    console.error("Error cleaning up test tasks:", error);
    res.status(500).json({
      success: false,
      error: "Failed to cleanup test tasks",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
