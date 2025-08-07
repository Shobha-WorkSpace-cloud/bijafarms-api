const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Supabase project URL and anon key
const supabaseUrl = 'https://dbmthxrbrlgkuhiznsul.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRibXRoeHJicmxna3VoaXpuc3VsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ1NTU0ODEsImV4cCI6MjA3MDEzMTQ4MX0.b6gFaZcT5AdVPomr7U-5Y2S_slIqza_4zeCtkC5s8Kc';

const supabase = createClient(supabaseUrl, supabaseKey);

// Get the current working directory and construct the path to the data folder
const baseDir = process.cwd();
const dataDir = path.join(baseDir, 'src', 'data');

async function importData() {
    try {
        // Helper function to read JSON files
        const readJsonFile = (filename) => {
            const filePath = path.join(dataDir, filename);
            const fileContent = fs.readFileSync(filePath, 'utf-8');
            return JSON.parse(fileContent);
        };

        // --- Clear Categories (Use with caution!) ---
        console.log('Clearing existing categories...');
        const { error: deleteError } = await supabase
            .from('categories')
            .delete()
            .neq('id', 0); // Delete all rows (you might adjust this condition)

        if (deleteError) {
            console.error('Error clearing categories:', deleteError);
            return;
        }
        console.log('Existing categories cleared.');
        // --- Import Categories ---
        console.log('Importing categories...');
        const categoriesData = readJsonFile('categories.json').categories;
        const categoriesToInsert = categoriesData.map(category => ({
            id:category.id,
            name: category.name,
            subCategories: category.subCategories,
            createdAt: category.createdAt ? new Date(category.createdAt) : null,
            lastUpdated: category.lastUpdated ? new Date(category.lastUpdated) : null,
        }));

        const { data: categories, error: categoriesError } = await supabase
            .from('categories')
            .insert(categoriesToInsert)
            .select();

        if (categoriesError) {
            console.error('Error importing categories:', categoriesError);
            return;
        }
        console.log('Categories imported successfully.');

        // Create a map for category name to ID
        const categoryMap = {};
        categories.forEach(cat => {
            categoryMap[cat.name] = cat.id;
        });


        // --- Import Animals ---
        console.log('Importing animals...');
        const animalsData = readJsonFile('animals.json');
        const animalsToInsert = animalsData.map(animal => ({
             // Remove original string id
            name: animal.name,
            type: animal.type,
            breed: animal.breed,
            gender: animal.gender,
            dateOfBirth: animal.dateOfBirth ? new Date(animal.dateOfBirth) : null,
            photos: animal.photos,
            status: animal.status,
            currentWeight: animal.currentWeight,
            markings: animal.markings,
            purchaseDate: animal.purchaseDate ? new Date(animal.purchaseDate) : null,
            purchasePrice: animal.purchasePrice,
            purchaseLocation: animal.purchaseLocation,
            previousOwner: animal.previousOwner,
            insured: animal.insured,
            insuranceProvider: animal.insuranceProvider,
            insurancePolicyNumber: animal.insurancePolicyNumber,
            insuranceAmount: animal.insuranceAmount,
            insuranceExpiryDate: animal.insuranceExpiryDate ? new Date(animal.insuranceExpiryDate) : null,
            createdAt: animal.createdAt ? new Date(animal.createdAt) : null,
            updatedAt: animal.updatedAt ? new Date(animal.updatedAt) : null,
            notes: animal.notes,
        }));
        const { data: animals, error: animalsError } = await supabase
            .from('animals')
            .insert(animalsToInsert)
            .select(); // Select the inserted data to get the generated IDs


        if (animalsError) {
            console.error('Error importing animals:', animalsError);
            return;
        }
        console.log('Animals imported successfully.');

        // Create a map for original animal ID (from JSON) to generated Supabase ID
        const animalMap = {};
        animalsData.forEach((animal, index) => {
            animalMap[animal.id] = animals[index].id;
        });


        // --- Import Tasks ---
        console.log('Importing tasks...');
        const tasksData = readJsonFile('TaskTracker.json');
        // Map category name to categoryId before inserting
        const tasksToInsert = tasksData.map(task => ({
            // Remove original string ID as Supabase will generate integer ID
            title: task.title,
            description: task.description,
            category: categoryMap[task.category], // Map category name to ID
            taskType: task.taskType,
            priority: task.priority,
            status: task.status,
            // Convert date strings to Date objects if needed by Supabase client
            dueDate: task.dueDate ? new Date(task.dueDate) : null,
            assignedTo: task.assignedTo,
            notes: task.notes,
            createdAt: task.createdAt ? new Date(task.createdAt) : null,
            reminderSent: task.reminderSent,
            completedAt: task.completedAt ? new Date(task.completedAt) : null,
        }));

        const { error: tasksError } = await supabase
            .from('tasks')
            .insert(tasksToInsert);

        if (tasksError) {
            console.error('Error importing tasks:', tasksError);
            return;
        }
        console.log('Tasks imported successfully.');


        // --- Import Expenses ---
        console.log('Importing expenses...');
        const expensesData = readJsonFile('expenses.json');
         // Map category name to categoryId before inserting
        const expensesToInsert = expensesData.map(expense => ({
             // Remove original string ID as Supabase will generate integer ID
            date: expense.date ? new Date(expense.date) : null,
            type: expense.type,
            description: expense.description,
            amount: expense.amount,
            paidBy: expense.paidBy,
            categoryId: categoryMap[expense.category], // Map category name to ID
            subCategory: expense.subCategory,
            source: expense.source,
            notes: expense.notes,
        }));

        const { error: expensesError } = await supabase
            .from('expenses')
            .insert(expensesToInsert);

        if (expensesError) {
            console.error('Error importing expenses:', expensesError);
            return;
        }
        console.log('Expenses imported successfully.');


        // --- Import Breeding Records ---
        console.log('Importing breeding records...');
        const breedingRecordsData = readJsonFile('breeding-records.json');
        // Map animal IDs before inserting
        const breedingRecordsToInsert = breedingRecordsData.map(record => ({
             // Remove original string ID as Supabase will generate integer ID
            motherId: animalMap[record.motherId], // Map original motherId to new Supabase ID
            fatherId: animalMap[record.fatherId], // Map original fatherId to new Supabase ID
             // Convert date strings to Date objects if needed by Supabase client
            breedingDate: record.breedingDate ? new Date(record.breedingDate) : null,
            expectedDeliveryDate: record.expectedDeliveryDate ? new Date(record.expectedDeliveryDate) : null,
            actualDeliveryDate: record.actualDeliveryDate ? new Date(record.actualDeliveryDate) : null,
            totalKids: record.totalKids,
            maleKids: record.maleKids,
            femaleKids: record.femaleKids,
            breedingMethod: record.breedingMethod,
            veterinarianName: record.veterinarianName, // Consider linking to a veterinarians table
            notes: record.notes,
            createdAt: record.createdAt ? new Date(record.createdAt) : null,
            updatedAt: record.updatedAt ? new Date(record.updatedAt) : null,
             // Ensure kidDetails is stored as JSONB if needed, otherwise remove or transform
            kid_details: record.kidDetails || null // Use the kidDetails field from JSON and map to kid_details column
        }));

        const { error: breedingRecordsError } = await supabase
            .from('breeding_records')
            .insert(breedingRecordsToInsert);

        if (breedingRecordsError) {
            console.error('Error importing breeding records:', breedingRecordsError);
            return;
        }
        console.log('Breeding records imported successfully.');

         // --- Import Health Records ---
        console.log('Importing health records...');
        const healthRecordsData = readJsonFile('health-records.json');
        // Map animal IDs before inserting
        const healthRecordsToInsert = healthRecordsData.map(record => ({
             // Remove original string ID as Supabase will generate integer ID
            animalId: animalMap[record.animalId], // Map original animalId to new Supabase ID
            recordType: record.recordType, // Consider using an ENUM for record type
            date: record.date ? new Date(record.date) : null,
            description: record.description,
            veterinarianName: record.veterinarianName, // Consider linking to a veterinarians table
            diagnosis: record.diagnosis,
            treatment: record.treatment,
            medications: record.medications,
            cost: record.cost,
            nextCheckupDate: record.nextCheckupDate ? new Date(record.nextCheckupDate) : null,
            notes: record.notes,
            createdAt: record.createdAt ? new Date(record.createdAt) : null,
        }));

        const { error: healthRecordsError } = await supabase
            .from('health_records')
            .insert(healthRecordsToInsert);

        if (healthRecordsError) {
            console.error('Error importing health records:', healthRecordsError);
            return;
        }
        console.log('Health records imported successfully.');

         // --- Import Vaccination Records ---
        console.log('Importing vaccination records...');
        const vaccinationRecordsData = readJsonFile('vaccination-records.json');
        // Map animal IDs before inserting
        const vaccinationRecordsToInsert = vaccinationRecordsData.map(record => ({
            animalId: animalMap[record.animalId], // Map original animalId to new Supabase ID
            vaccineName: record.vaccineName,
            vaccineType: record.vaccineType,
             // Convert date strings to Date objects if needed by Supabase client
            administrationDate: record.administrationDate ? new Date(record.administrationDate) : null,
            nextDueDate: record.nextDueDate ? new Date(record.nextDueDate) : null,
            batchNumber: record.batchNumber,
            veterinarianName: record.veterinarianName, // Consider linking to a veterinarians table
            dosage: record.dosage,
            administrationMethod: record.administrationMethod,
            cost: record.cost,
            notes: record.notes,
             createdAt: record.createdAt ? new Date(record.createdAt) : null,
        }));

        const { error: vaccinationRecordsError } = await supabase
            .from('vaccination_records')
            .insert(vaccinationRecordsToInsert);

        if (vaccinationRecordsError) {
            console.error('Error importing vaccination records:', vaccinationRecordsError);
            return;
        }
        console.log('Vaccination records imported successfully.');

         // --- Import Weight Records ---
        console.log('Importing weight records...');
        const weightRecordsData = readJsonFile('weight-records.json');
        // Map animal IDs before inserting
        const weightRecordsToInsert = weightRecordsData.map(record => ({
            animalId: animalMap[record.animalId], // Map original animalId to new Supabase ID
            weight: record.weight,
             // Convert date strings to Date objects if needed by Supabase client
            date: record.date ? new Date(record.date) : null,
            notes: record.notes,
            recordedBy: record.recordedBy, // Consider linking to a users or employees table
             createdAt: record.createdAt ? new Date(record.createdAt) : null,
        }));

        const { error: weightRecordsError } = await supabase
            .from('weight_records')
            .insert(weightRecordsToInsert);

        if (weightRecordsError) {
            console.error('Error importing weight records:', weightRecordsError);
            return;
        }
        console.log('Weight records imported successfully.');


    } catch (error) {
        console.error('An error occurred during data import:', error);
    }
}

importData();
