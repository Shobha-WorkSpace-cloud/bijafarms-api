import { RequestHandler } from "express";

interface WhatsAppReminderRequest {
  phone: string;
  message: string;
  taskTitle: string;
  dueDate: string;
}

interface WhatsAppResponse {
  success: boolean;
  message: string;
  whatsappUrl?: string;
  data?: any;
}

// WhatsApp Web URL generator for farm task reminders
const generateWhatsAppURL = (phone: string, message: string): string => {
  // Format phone number - ensure it starts with 91 for India (without +)
  const formattedPhone = phone.startsWith("+91")
    ? phone.substring(1) // Remove + but keep 91
    : phone.startsWith("91")
      ? phone // Keep as is
      : phone.startsWith("0")
        ? "91" + phone.substring(1) // Replace 0 with 91
        : "91" + phone; // Add 91 prefix

  // Encode the message for URL
  const encodedMessage = encodeURIComponent(message);

  // Generate WhatsApp Web URL
  const whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodedMessage}`;

  console.log(`Generated WhatsApp URL for: ${formattedPhone}`);
  console.log(`Message: ${message}`);

  return whatsappUrl;
};

// Send WhatsApp reminder (generates URL for manual sending)
const sendWhatsAppReminder = async (
  phone: string,
  message: string,
): Promise<WhatsAppResponse> => {
  try {
    const whatsappUrl = generateWhatsAppURL(phone, message);

    return {
      success: true,
      message: "WhatsApp URL generated successfully",
      whatsappUrl: whatsappUrl,
      data: {
        phone: phone,
        formattedPhone: phone.startsWith("+91") ? phone.substring(1) : phone,
        message: message,
      },
    };
  } catch (error) {
    console.error("Error generating WhatsApp URL:", error);
    return {
      success: false,
      message: "Failed to generate WhatsApp URL",
      data: error instanceof Error ? error.message : "Unknown error",
    };
  }
};

export const sendWhatsAppReminderEndpoint: RequestHandler = async (
  req,
  res,
) => {
  try {
    const { phone, message, taskTitle, dueDate }: WhatsAppReminderRequest =
      req.body;

    console.log(
      `WhatsApp Reminder - Phone: ${phone}, Task: ${taskTitle}, Due: ${dueDate}`,
    );

    // Generate WhatsApp URL
    const whatsappResponse = await sendWhatsAppReminder(phone, message);

    if (whatsappResponse.success) {
      res.json({
        success: true,
        message: "WhatsApp reminder URL generated successfully",
        phone: phone,
        taskTitle: taskTitle,
        generatedAt: new Date().toISOString(),
        provider: "WhatsApp",
        whatsappUrl: whatsappResponse.whatsappUrl,
        providerResponse: whatsappResponse,
      });
    } else {
      console.error("WhatsApp error:", whatsappResponse);
      res.status(400).json({
        success: false,
        error: "Failed to generate WhatsApp URL",
        details: whatsappResponse.message || "Unknown error",
      });
    }
  } catch (error) {
    console.error("Error generating WhatsApp reminder:", error);
    res.status(500).json({
      success: false,
      error: "Failed to generate WhatsApp reminder",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Test SMS endpoint to validate SMSIndiaHub integration
// Simple test WhatsApp endpoint
export const sendTestWhatsAppSimple: RequestHandler = async (req, res) => {
  console.log("=== Simple Test WhatsApp Request ===");

  res.setHeader("Content-Type", "application/json");

  try {
    const testMessage = `🧪 TEST: Bija Farms WhatsApp working! ${new Date().toLocaleTimeString()}`;
    console.log("Test message:", testMessage);

    res.status(200).json({
      success: true,
      message: "Test WhatsApp endpoint working",
      phone: "+919985442209",
      testMessage: testMessage,
      generatedAt: new Date().toISOString(),
      provider: "WhatsApp",
    });
  } catch (error) {
    console.error("Simple test error:", error);
    res.status(500).json({
      success: false,
      error: "Test failed",
      details: String(error),
    });
  }
};

export const sendTestWhatsApp: RequestHandler = async (req, res) => {
  try {
    console.log("=== Test WhatsApp Request Started ===");

    const testMessage = `🧪 TEST MESSAGE from Bija Farms: WhatsApp integration is working! Sent at ${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}`;

    console.log("Generating test WhatsApp URL for +919985442209...");
    console.log("Test message:", testMessage);

    const whatsappResponse = await sendWhatsAppReminder(
      "+919985442209",
      testMessage,
    );
    console.log("WhatsApp Response received:", whatsappResponse);

    if (whatsappResponse.success) {
      console.log("✅ Test WhatsApp URL generated successfully");
      res.json({
        success: true,
        message: "Test WhatsApp URL generated successfully",
        phone: "+919985442209",
        testMessage: testMessage,
        generatedAt: new Date().toISOString(),
        provider: "WhatsApp",
        whatsappUrl: whatsappResponse.whatsappUrl,
        providerResponse: whatsappResponse,
      });
    } else {
      console.error("❌ WhatsApp test error:", whatsappResponse);
      res.status(400).json({
        success: false,
        error: "Failed to generate test WhatsApp URL",
        details: whatsappResponse.message || "Unknown error",
        providerResponse: whatsappResponse,
      });
    }
  } catch (error) {
    console.error("❌ Error generating test WhatsApp:", error);
    res.status(500).json({
      success: false,
      error: "Failed to generate test WhatsApp",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const scheduleReminder: RequestHandler = async (req, res) => {
  try {
    const { taskId, title, dueDate, description } = req.body;

    // Calculate reminder date (1 day before due date)
    const dueDateObj = new Date(dueDate);
    const reminderDate = new Date(dueDateObj);
    reminderDate.setDate(reminderDate.getDate() - 1);

    const now = new Date();
    const timeUntilReminder = reminderDate.getTime() - now.getTime();

    // If reminder date is in the past or today, generate immediate WhatsApp URL
    if (timeUntilReminder <= 0) {
      const message = `🚨 URGENT: Farm task "${title}" is due ${dueDate === now.toISOString().split("T")[0] ? "TODAY" : "OVERDUE"}! Please complete: ${description}`;

      try {
        const whatsappResponse = await sendWhatsAppReminder(
          "+919985442209",
          message,
        );

        return res.json({
          success: true,
          message:
            "Immediate reminder WhatsApp URL generated (task is due soon)",
          scheduledFor: "immediate",
          provider: "WhatsApp",
          whatsappUrl: whatsappResponse.whatsappUrl,
          whatsappStatus: whatsappResponse.success ? "generated" : "failed",
        });
      } catch (error) {
        console.error("Failed to generate immediate WhatsApp URL:", error);
        return res.status(500).json({
          success: false,
          error: "Failed to generate immediate WhatsApp reminder",
          details: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    // Schedule reminder for 1 day before
    setTimeout(async () => {
      const message = `⏰ Reminder: Farm task "${title}" is due tomorrow (${dueDate}). Description: ${description}. Please prepare accordingly.`;

      try {
        const whatsappResponse = await sendWhatsAppReminder(
          "+919985442209",
          message,
        );
        console.log(`WhatsApp reminder URL generated for task: ${title}`);
        console.log(`WhatsApp URL: ${whatsappResponse.whatsappUrl}`);
      } catch (error) {
        console.error(
          `Failed to generate WhatsApp reminder for task ${title}:`,
          error,
        );
      }
    }, timeUntilReminder);

    res.json({
      success: true,
      message: "Reminder scheduled successfully",
      taskId,
      scheduledFor: reminderDate.toISOString(),
      timeUntilReminder:
        Math.round(timeUntilReminder / (1000 * 60 * 60)) + " hours",
    });
  } catch (error) {
    console.error("Error scheduling reminder:", error);
    res.status(500).json({
      success: false,
      error: "Failed to schedule reminder",
    });
  }
};
