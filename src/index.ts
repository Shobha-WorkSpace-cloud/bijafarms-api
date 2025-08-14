import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import {
  getExpenses,
  addExpense,
  updateExpense,
  deleteExpense,
  importExpenses,
  bulkDeleteExpenses,
  backupExpenses,
  getCategories,
  saveCategories,
  populateCategories,
} from "./routes/expenses";
import {
  sendWhatsAppReminderEndpoint,
  scheduleReminder,
  sendTestWhatsApp,
  sendTestWhatsAppSimple,
} from "./routes/sms-reminders";
import {
  getTasks,
  addTask,
  updateTask,
  deleteTask,
  bulkDeleteTasks,
  backupTasks,
  importTasks,
} from "./routes/tasks";
import {
  createTestReminderTask,
  checkReminderValidation,
  cleanupTestTasks,
} from "./routes/test-reminder";
import {
  getAnimals,
  addAnimal,
  updateAnimal,
  deleteAnimal,
  getWeightRecords,
  addWeightRecord,
  getBreedingRecords,
  addBreedingRecord,
  getVaccinationRecords,
  addVaccinationRecord,
  getHealthRecords,
  addHealthRecord,
  getAnimalSummary,
  backupAnimals,
} from "./routes/animals";

function createServer() {
  const app = express();

  // Middleware
  const corsOrigin = process.env.CORS_ORIGIN || "http://localhost:8080,https://shobha-workspace-cloud.github.io";
  const allowedOrigins = corsOrigin.split(',').map(origin => origin.trim());
  
  app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (allowedOrigins.includes(origin)) {
      res.header('Access-Control-Allow-Origin', origin);
    }
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin,X-Requested-With,Content-Type,Accept,Authorization');
    
    if (req.method === 'OPTIONS') {
      res.sendStatus(200);
    } else {
      next();
    }
  });
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  console.log(`🚀 Server starting with CORS origins: ${allowedOrigins.join(', ')}`);
  console.log(`🔧 CORS middleware configured for preflight requests`);

  // API base path
  const apiBasePath = "/api";

  // Helper function to register routes
  const registerRoute = (
    method: "get" | "post" | "put" | "delete",
    path: string,
    handler: any,
  ) => {
    const fullPath = `${apiBasePath}${path}`;
    app[method](fullPath, handler);
    console.log(`📝 Registered: ${method.toUpperCase()} ${fullPath}`);
  };

  // Root route - API information
  app.get("/", (_req: any, res: any) => {
    res.json({
      name: "Bijafarms Backend API",
      version: "1.0.0",
      description: "Backend API for Bijafarms farm management system",
      endpoints: {
        ping: "/api/ping",
        demo: "/api/demo",
        expenses: "/api/expenses",
        tasks: "/api/tasks",
        animals: "/api/animals",
        reminders: "/api/send-whatsapp-reminder"
      },
      status: "running"
    });
  });

  // Example API routes
  registerRoute("get", "/ping", (_req: any, res: any) => {
    const ping = process.env.PING_MESSAGE ?? "Backend API is running";
    res.json({ message: ping });
  });

  registerRoute("get", "/demo", handleDemo);

  // Expense routes
  registerRoute("get", "/expenses", getExpenses);
  registerRoute("post", "/expenses", addExpense);
  registerRoute("put", "/expenses/:id", updateExpense);
  registerRoute("delete", "/expenses/:id", deleteExpense);
  registerRoute("post", "/expenses/import", importExpenses);
  registerRoute("post", "/expenses/bulk-delete", bulkDeleteExpenses);
  registerRoute("get", "/expenses/backup", backupExpenses);
  registerRoute("get", "/expenses/categories", getCategories);
  registerRoute("post", "/expenses/categories", saveCategories);
  registerRoute("post", "/expenses/populate-categories", populateCategories);

  // WhatsApp reminder routes
  registerRoute(
    "post",
    "/send-whatsapp-reminder",
    sendWhatsAppReminderEndpoint,
  );
  registerRoute("post", "/schedule-reminder", scheduleReminder);
  registerRoute("post", "/test-whatsapp", sendTestWhatsApp);
  registerRoute("post", "/test-whatsapp-simple", sendTestWhatsAppSimple);

  // Task management routes
  registerRoute("get", "/tasks", getTasks);
  registerRoute("post", "/tasks", addTask);
  registerRoute("put", "/tasks/:id", updateTask);
  registerRoute("delete", "/tasks/:id", deleteTask);
  registerRoute("post", "/tasks/bulk-delete", bulkDeleteTasks);
  registerRoute("get", "/tasks/backup", backupTasks);
  registerRoute("post", "/tasks/import", importTasks);

  // Test reminder validation routes
  registerRoute("post", "/test-reminder-validation", createTestReminderTask);
  registerRoute("get", "/test-reminder-validation", checkReminderValidation);
  registerRoute("delete", "/test-reminder-validation", cleanupTestTasks);

  // Animal management routes
  registerRoute("get", "/animals", getAnimals);
  registerRoute("post", "/animals", addAnimal);
  registerRoute("put", "/animals/:id", updateAnimal);
  registerRoute("delete", "/animals/:id", deleteAnimal);
  registerRoute("get", "/animals/summary", getAnimalSummary);
  registerRoute("get", "/animals/backup", backupAnimals);

  // Animal record routes
  registerRoute("get", "/weight-records", getWeightRecords);
  registerRoute("post", "/weight-records", addWeightRecord);
  registerRoute("get", "/breeding-records", getBreedingRecords);
  registerRoute("post", "/breeding-records", addBreedingRecord);
  registerRoute("get", "/vaccination-records", getVaccinationRecords);
  registerRoute("post", "/vaccination-records", addVaccinationRecord);
  registerRoute("get", "/health-records", getHealthRecords);
  registerRoute("post", "/health-records", addHealthRecord);

  return app;
}

// Start server if this file is run directly
if (require.main === module) {
  const app = createServer();
  const port = process.env.PORT || 3031;

  app.listen(port, () => {
    console.log(`🚀 Backend server running on http://localhost:${port}`);
    console.log(`📡 API endpoints available at http://localhost:${port}/api`);
    console.log(`🔗 Visit http://localhost:${port}/api/ping to test the API`);
  });
}

module.exports = { createServer };
