import { RequestHandler } from "express";
import {
  ExpenseRecord,
  CategoryManagementData,
  CategoryConfig,
} from "@shared/expense-types";
import supabase from './supabaseClient';
import logger from '../utils/errorLogger';

const readExpenses = async (): Promise<ExpenseRecord[]> => {
  try {
    const { data:expenses, error } = await supabase
      .from('allexpenses')
      .select('*');
    
    if (error ) {
      console.error("Supabase error:", error);      
    }
    if (!expenses) return [];    
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
            };});
  } catch (error) {
    console.error("Error reading expenses:", error);
    return [];
  }
};

// Helper function to insert a single expense
const insertExpense = async (expense: ExpenseRecord): Promise<any> => {
  try {
    console.log("Attempting to insert expense:", expense);

    // Look up category ID from categories table
    const { data: categoryData, error: categoryError } = await supabase
      .from('categories')
      .select('id')
      .eq('name', expense.category)
      .single();

    let categoryId;
    if (categoryError) {
      await logger.error(`Error fetching category for ${expense.category}`, "expenses.insertExpense", categoryError);
      const subCatgrs: string[] = [expense.subCategory];
      // If category doesn't exist, create it
      const { data: newCategory, error: createError } = await supabase
        .from('categories')
        .insert([{ name: expense.category, subCategories: subCatgrs || ["General"] }])
        .select('id')
        .single();

      if (createError) {
        await logger.error(`Error creating category ${expense.category}`, "expenses.insertExpense", createError);
        throw createError;
      }

      await logger.info(`Created new category: ${expense.category} with ID: ${newCategory.id}`, "expenses.insertExpense");
      categoryId = newCategory.id;
    } else {
      categoryId = categoryData.id;
      await logger.info(`Found category ${expense.category} with ID: ${categoryId}`, "expenses.insertExpense");
    }

    // Insert expense with categoryId
    const expenseData = {
      description: expense.description,
      amount: expense.amount,
      type: expense.type,
      date: expense.date,
      paidBy: expense.paidBy,
      categoryId: categoryId,
      subCategory: expense.subCategory || null,
      source: expense.source || null,
      notes: expense.notes || null,
    };

    await logger.info("Inserting expense data", "expenses.insertExpense", { amount: expenseData.amount, categoryId: expenseData.categoryId });

    const { data, error: insertError } = await supabase
      .from('expenses')
      .insert([expenseData])
      .select();

    if (insertError) {
      await logger.error("Supabase insert error for expense", "expenses.insertExpense", { description: expense.description, error: insertError });
      throw insertError;
    }

    console.log("Successfully inserted expense:", data);
    return data[0];
  } catch (error) {
    console.error("Error inserting expense:", error);
    throw error;
  }
};

// Helper function to read categories from Supabase
const readCategories = async (): Promise<CategoryManagementData> => {
  try {
    const { data: categories, error } = await supabase
      .from('categories')
      .select('*')
      .order('id', { ascending: true });

    if (error) {
      console.error("Supabase error:", error);
      return { categories: [], lastUpdated: new Date().toISOString() };
    }

    const categoryConfigs: CategoryConfig[] = categories?.map(cat => ({
      id: cat.id.toString(),
      name: cat.name,
      subCategories: cat.subCategories || [],
      createdAt: cat.createdAt || new Date().toISOString()
    })) || [];

    return {
      categories: categoryConfigs,
      lastUpdated: new Date().toISOString()
    };
  } catch (error) {
    console.error("Error reading categories:", error);
    return { categories: [], lastUpdated: new Date().toISOString() };
  }
};

// Helper function to write categories to Supabase
const writeCategories = async (data: CategoryManagementData): Promise<void> => {
  try {
    // For simplicity, we'll clear and re-insert all categories
    // In production, you might want more sophisticated upsert logic

    // First, delete existing categories
    await supabase
      .from('categories')
      .delete()
      .gte('id', 0);

    // Then insert new categories
    if (data.categories && data.categories.length > 0) {
      const categoriesToInsert = data.categories.map(cat => ({
        name: cat.name,
        subCategories: cat.subCategories || []
      }));

      const { error } = await supabase
        .from('categories')
        .insert(categoriesToInsert);

      if (error) {
        console.error("Supabase insert error:", error);
        throw error;
      }
    }
  } catch (error) {
    console.error("Error writing categories:", error);
    throw error;
  }
};

// GET /api/expenses - Get all expenses
export const getExpenses: RequestHandler = async (req, res) => {
  try {
    const expenses = await readExpenses();
    res.json(expenses);
  } catch (error) {
    console.error("Error getting expenses:", error);
    res.status(500).json({ error: "Failed to fetch expenses" });
  }
};

// POST /api/expenses - Add new expense
export const addExpense: RequestHandler = async (req, res) => {
  try {
    const newExpense: ExpenseRecord = req.body;

    // Validate required fields
    if (!newExpense.description || !newExpense.amount || !newExpense.category) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const insertedExpense = await insertExpense(newExpense);

    // Transform the response to match expected format
    const responseExpense = {
      id: insertedExpense.id.toString(),
      date: insertedExpense.date,
      type: insertedExpense.type,
      description: insertedExpense.description,
      amount: insertedExpense.amount,
      paidBy: insertedExpense.paidBy,
      category: newExpense.category, // Use original category name
      subCategory: insertedExpense.subCategory,
      source: insertedExpense.source,
      notes: insertedExpense.notes,
    };

    res.status(201).json(responseExpense);
  } catch (error) {
    console.error("Error adding expense:", error);
    res.status(500).json({ error: "Failed to add expense" });
  }
};

// PUT /api/expenses/:id - Update existing expense
export const updateExpense: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedExpense: ExpenseRecord = req.body;

    // Look up category ID if category is provided
    let categoryId;
    if (updatedExpense.category) {
      const { data: categoryData, error: categoryError } = await supabase
        .from('categories')
        .select('id')
        .eq('name', updatedExpense.category)
        .single();

      if (categoryError) {
        // If category doesn't exist, create it
        const { data: newCategory, error: createError } = await supabase
          .from('categories')
          .insert([{ name: updatedExpense.category, subCategories: [updatedExpense.subCategory || "General"] }])
          .select('id')
          .single();

        if (createError) {
          console.error(`Error creating category ${updatedExpense.category}:`, createError);
          return res.status(500).json({ error: "Failed to create category" });
        }
        categoryId = newCategory.id;
      } else {
        categoryId = categoryData.id;
      }
    }

    // Prepare update data
    const updateData: any = {
      description: updatedExpense.description,
      amount: updatedExpense.amount,
      type: updatedExpense.type,
      date: updatedExpense.date,
      paidBy: updatedExpense.paidBy,
      subCategory: updatedExpense.subCategory,
      source: updatedExpense.source,
      notes: updatedExpense.notes,
    };

    if (categoryId) {
      updateData.categoryId = categoryId;
    }

    // Update in Supabase
    const { data, error } = await supabase
      .from('expenses')
      .update(updateData)
      .eq('id', parseInt(id))
      .select();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: "Expense not found" });
      }
      console.error("Supabase update error:", error);
      return res.status(500).json({ error: "Failed to update expense" });
    }

    if (!data || data.length === 0) {
      return res.status(404).json({ error: "Expense not found" });
    }

    // Transform response to match expected format
    const responseExpense = {
      id: data[0].id.toString(),
      date: data[0].date,
      type: data[0].type,
      description: data[0].description,
      amount: data[0].amount,
      paidBy: data[0].paidBy,
      category: updatedExpense.category || data[0].category,
      subCategory: data[0].subCategory,
      source: data[0].source,
      notes: data[0].notes,
    };

    res.json(responseExpense);
  } catch (error) {
    console.error("Error updating expense:", error);
    res.status(500).json({ error: "Failed to update expense" });
  }
};

// DELETE /api/expenses/:id - Delete expense
export const deleteExpense: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', parseInt(id));

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: "Expense not found" });
      }
      console.error("Supabase delete error:", error);
      return res.status(500).json({ error: "Failed to delete expense" });
    }

    res.json({ message: "Expense deleted successfully" });
  } catch (error) {
    console.error("Error deleting expense:", error);
    res.status(500).json({ error: "Failed to delete expense" });
  }
};

// POST /api/expenses/import - Import multiple expenses
export const importExpenses: RequestHandler = async (req, res) => {
  try {
    const importedExpenses: ExpenseRecord[] = req.body;

    if (!Array.isArray(importedExpenses)) {
      return res.status(400).json({ error: "Expected array of expenses" });
    }

    let successCount = 0;
    const errors: string[] = [];

    // Insert each expense individually to handle category creation
    for (const expense of importedExpenses) {
      try {
        await insertExpense(expense);
        successCount++;
      } catch (error) {
        console.error(`Error importing expense: ${expense.description}:`, error);
        errors.push(`Failed to import: ${expense.description}`);
      }
    }

    const response: any = {
      message: "Import completed",
      successCount: successCount,
      totalCount: importedExpenses.length,
    };

    if (errors.length > 0) {
      response.errors = errors;
      response.message = `Import completed with ${errors.length} errors`;
    }

    res.json(response);
  } catch (error) {
    console.error("Error importing expenses:", error);
    res.status(500).json({ error: "Failed to import expenses" });
  }
};

// POST /api/expenses/bulk-delete - Delete multiple expenses
export const bulkDeleteExpenses: RequestHandler = async (req, res) => {
  try {
    const { ids }: { ids: string[] } = req.body;

    if (!Array.isArray(ids)) {
      return res.status(400).json({ error: "Expected array of IDs" });
    }

    // Convert string IDs to integers
    const numericIds = ids.map(id => parseInt(id)).filter(id => !isNaN(id));

    if (numericIds.length === 0) {
      return res.status(400).json({ error: "No valid IDs provided" });
    }

    const { error } = await supabase
      .from('expenses')
      .delete()
      .in('id', numericIds);

    if (error) {
      console.error("Supabase bulk delete error:", error);
      return res.status(500).json({ error: "Failed to delete expenses" });
    }

    res.json({
      message: "Expenses deleted successfully",
      deletedCount: numericIds.length,
    });
  } catch (error) {
    console.error("Error bulk deleting expenses:", error);
    res.status(500).json({ error: "Failed to delete expenses" });
  }
};

// GET /api/expenses/backup - Create backup of expenses
export const backupExpenses: RequestHandler = async (req, res) => {
  try {
    const expenses = await readExpenses();
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const backupFileName = `expenses-backup-${timestamp}.json`;

    res.setHeader("Content-Type", "application/json");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${backupFileName}"`,
    );
    res.json(expenses);
  } catch (error) {
    console.error("Error creating backup:", error);
    res.status(500).json({ error: "Failed to create backup" });
  }
};

// GET /api/expenses/categories - Get categories
export const getCategories: RequestHandler = async (req, res) => {
  try {
    const categories = await readCategories();
    res.json(categories);
  } catch (error) {
    console.error("Error getting categories:", error);
    res.status(500).json({ error: "Failed to fetch categories" });
  }
};

// POST /api/expenses/categories - Save categories
export const saveCategories: RequestHandler = async (req, res) => {
  try {
    const categoryData: CategoryManagementData = req.body;

    // Validate required fields
    if (!categoryData.categories || !Array.isArray(categoryData.categories)) {
      return res.status(400).json({ error: "Invalid categories data" });
    }

    await writeCategories(categoryData);
    res.json({ message: "Categories saved successfully" });
  } catch (error) {
    console.error("Error saving categories:", error);
    res.status(500).json({ error: "Failed to save categories" });
  }
};

// POST /api/expenses/populate-categories - Populate categories from existing expense data
export const populateCategories: RequestHandler = async (req, res) => {
  try {
    const expenses = await readExpenses();
    const categoryMap: { [key: string]: Set<string> } = {};

    // Extract categories and sub-categories from existing expenses
    expenses.forEach((expense:ExpenseRecord) => {
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
    const categories: CategoryConfig[] = Object.entries(categoryMap).map(
      ([categoryName, subCategoriesSet], index) => {
        // Clean up and deduplicate sub-categories
        const subCategories = Array.from(subCategoriesSet)
          .filter((sub) => sub && sub.trim() !== "")
          .map((sub) => {
            // Standardize common variations
            if (sub.toLowerCase() === "misc") return "Misc";
            if (sub.toLowerCase() === "plubming") return "Plumbing";
            if (sub.toLowerCase() === "solar") return "Solar";
            if (sub.toLowerCase() === "doors") return "Doors";
            if (sub.toLowerCase() === "electric") return "Electric";
            return sub;
          })
          .filter(
            (sub, idx, arr) =>
              arr.findIndex((s) => s.toLowerCase() === sub.toLowerCase()) ===
              idx,
          ) // Remove duplicates
          .sort(); // Sort alphabetically

        return {
          id: (Date.now() + index).toString(),
          name: categoryName,
          subCategories: subCategories.length > 0 ? subCategories : ["General"],
          createdAt: new Date().toISOString(),
        };
      },
    );

    // Sort categories alphabetically
    categories.sort((a, b) => a.name.localeCompare(b.name));

    const categoryData: CategoryManagementData = {
      categories,
      lastUpdated: new Date().toISOString(),
    };

    writeCategories(categoryData);

    res.json({
      message: "Categories populated successfully",
      count: categories.length,
      categories: categoryData,
    });
  } catch (error) {
    console.error("Error populating categories:", error);
    res.status(500).json({ error: "Failed to populate categories" });
  }
};
