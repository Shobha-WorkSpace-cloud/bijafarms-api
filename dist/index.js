"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const demo_1 = require("./routes/demo");
const supabase_js_1 = require("@supabase/supabase-js");
const supabaseUrl = 'https://dbmthxrbrlgkuhiznsul.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRibXRoeHJicmxna3VoaXpuc3VsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ1NTU0ODEsImV4cCI6MjA3MDEzMTQ4MX0.b6gFaZcT5AdVPomr7U-5Y2S_slIqza_4zeCtkC5s8Kc';
const supabase = (0, supabase_js_1.createClient)(supabaseUrl, supabaseKey);
const expenses_1 = require("./routes/expenses");
const sms_reminders_1 = require("./routes/sms-reminders");
const tasks_1 = require("./routes/tasks");
const test_reminder_1 = require("./routes/test-reminder");
const animals_1 = require("./routes/animals");
function createServer() {
    const app = (0, express_1.default)();
    // CORS configuration
    const allowedOrigins = [
        'http://localhost:8080', // For local development
        'http://localhost:10000', // For local render deployment
        'https://shobha-workspace-cloud.github.io', // Add your GitHub Pages origin here
    ];
    app.use((0, cors_1.default)({
        origin: (origin, callback) => {
            if (!origin || allowedOrigins.includes(origin)) {
                callback(null, true);
            }
            else {
                callback(new Error("Not allowed by CORS"));
            }
        },
        credentials: true,
    }));
    app.use(express_1.default.json());
    app.use(express_1.default.urlencoded({ extended: true }));
    console.log(`Allowing origins: ${allowedOrigins.join(", ")}`);
    // API base path
    const apiBasePath = "/api";
    // Helper function to register routes
    const registerRoute = (method, path, handler) => {
        const fullPath = `${apiBasePath}${path}`;
        app[method](fullPath, handler);
        console.log(`📝 Registered: ${method.toUpperCase()} ${fullPath}`);
    };
    // Example API routes
    registerRoute("get", "/ping", (_req, res) => {
        const ping = process.env.PING_MESSAGE ?? "Backend API is running";
        res.json({ message: ping });
    });
    registerRoute("get", "/demo", demo_1.handleDemo);
    // Expense routes
    registerRoute("get", "/expenses", expenses_1.getExpenses);
    registerRoute("post", "/expenses", expenses_1.addExpense);
    registerRoute("put", "/expenses/:id", expenses_1.updateExpense);
    registerRoute("delete", "/expenses/:id", expenses_1.deleteExpense);
    registerRoute("post", "/expenses/import", expenses_1.importExpenses);
    registerRoute("post", "/expenses/bulk-delete", expenses_1.bulkDeleteExpenses);
    registerRoute("get", "/expenses/backup", expenses_1.backupExpenses);
    registerRoute("get", "/expenses/categories", expenses_1.getCategories);
    registerRoute("post", "/expenses/categories", expenses_1.saveCategories);
    registerRoute("post", "/expenses/populate-categories", expenses_1.populateCategories);
    // WhatsApp reminder routes
    registerRoute("post", "/send-whatsapp-reminder", sms_reminders_1.sendWhatsAppReminderEndpoint);
    registerRoute("post", "/schedule-reminder", sms_reminders_1.scheduleReminder);
    registerRoute("post", "/test-whatsapp", sms_reminders_1.sendTestWhatsApp);
    registerRoute("post", "/test-whatsapp-simple", sms_reminders_1.sendTestWhatsAppSimple);
    // Task management routes
    registerRoute("get", "/tasks", tasks_1.getTasks);
    registerRoute("post", "/tasks", tasks_1.addTask);
    registerRoute("put", "/tasks/:id", tasks_1.updateTask);
    registerRoute("delete", "/tasks/:id", tasks_1.deleteTask);
    registerRoute("post", "/tasks/bulk-delete", tasks_1.bulkDeleteTasks);
    registerRoute("get", "/tasks/backup", tasks_1.backupTasks);
    registerRoute("post", "/tasks/import", tasks_1.importTasks);
    // Test reminder validation routes
    registerRoute("post", "/test-reminder-validation", test_reminder_1.createTestReminderTask);
    registerRoute("get", "/test-reminder-validation", test_reminder_1.checkReminderValidation);
    registerRoute("delete", "/test-reminder-validation", test_reminder_1.cleanupTestTasks);
    // Animal management routes
    registerRoute("get", "/animals", animals_1.getAnimals);
    registerRoute("post", "/animals", animals_1.addAnimal);
    registerRoute("put", "/animals/:id", animals_1.updateAnimal);
    registerRoute("delete", "/animals/:id", animals_1.deleteAnimal);
    registerRoute("get", "/animals/summary", animals_1.getAnimalSummary);
    registerRoute("get", "/animals/backup", animals_1.backupAnimals);
    // Animal record routes
    registerRoute("get", "/weight-records", animals_1.getWeightRecords);
    registerRoute("post", "/weight-records", animals_1.addWeightRecord);
    registerRoute("get", "/breeding-records", animals_1.getBreedingRecords);
    registerRoute("post", "/breeding-records", animals_1.addBreedingRecord);
    registerRoute("get", "/vaccination-records", animals_1.getVaccinationRecords);
    registerRoute("post", "/vaccination-records", animals_1.addVaccinationRecord);
    registerRoute("get", "/health-records", animals_1.getHealthRecords);
    registerRoute("post", "/health-records", animals_1.addHealthRecord);
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
//# sourceMappingURL=index.js.map