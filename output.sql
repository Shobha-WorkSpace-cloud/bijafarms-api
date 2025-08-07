-- Create the "tasks" table
CREATE TABLE tasks (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    title TEXT,
    description TEXT,
    category TEXT, -- Consider linking to a categories table
    "taskType" TEXT,
    priority TEXT,
    status TEXT,
    "dueDate" DATE,
    "assignedTo" TEXT, -- Consider linking to a users or employees table
    notes TEXT,
    "createdAt" TIMESTAMP WITH TIME ZONE,
    "reminderSent" BOOLEAN,
    "completedAt" TIMESTAMP WITH TIME ZONE
);

-- Create the "animals" table
CREATE TABLE animals (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name TEXT,
    type TEXT, -- Consider linking to an animal_types table
    breed TEXT,
    gender TEXT,
    "dateOfBirth" DATE,
    photos TEXT[], -- Array of Text
    status TEXT,
    "currentWeight" NUMERIC,
    markings TEXT,
    "purchaseDate" DATE,
    "purchasePrice" NUMERIC,
    "purchaseLocation" TEXT,
    "previousOwner" TEXT,
    insured BOOLEAN,
    "insuranceProvider" TEXT,
    "insurancePolicyNumber" TEXT,
    "insuranceAmount" NUMERIC,
    "insuranceExpiryDate" DATE,
    "createdAt" TIMESTAMP WITH TIME ZONE,
    "updatedAt" TIMESTAMP WITH TIME ZONE,
    notes TEXT
);

-- Create the "breeding_records" table
CREATE TABLE breeding_records (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    "motherId" INT REFERENCES animals(id),
    "fatherId" INT REFERENCES animals(id),
    "breedingDate" DATE,
    "expectedDeliveryDate" DATE,
    "actualDeliveryDate" DATE,
    "totalKids" INTEGER,
    "maleKids" INTEGER,
    "femaleKids" INTEGER,
    "breedingMethod" TEXT,
    "veterinarianName" TEXT, -- Consider linking to a veterinarians table
    notes TEXT,
    "createdAt" TIMESTAMP WITH TIME ZONE,
    "updatedAt" TIMESTAMP WITH TIME ZONE,
    kid_details JSONB -- Storing kid details as JSONB
);

-- Create the "categories" table
CREATE TABLE categories (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name TEXT UNIQUE, -- Added UNIQUE constraint to name for potential future use or alternative referencing
    "subCategories" TEXT[], -- Array of Text
    "createdAt" TIMESTAMP WITH TIME ZONE,
    "lastUpdated" TIMESTAMP WITH TIME ZONE
);

-- Create the "expenses" table
CREATE TABLE expenses (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    date DATE,
    type TEXT, -- Consider using an ENUM for expense type
    description TEXT,
    amount NUMERIC,
    "paidBy" TEXT, -- Consider linking to a users or employees table
    "categoryId" INT REFERENCES categories(id), -- Corrected: Linking to categories table by id
    "subCategory" TEXT,
    source TEXT, -- Consider using an ENUM or a separate table for sources
    notes TEXT
);

-- Create the "health_records" table
CREATE TABLE health_records (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    "animalId" INT REFERENCES animals(id),
    "recordType" TEXT, -- Consider using an ENUM for record type
    date DATE,
    description TEXT,
    "veterinarianName" TEXT, -- Consider linking to a veterinarians table
    diagnosis TEXT,
    treatment TEXT,
    medications TEXT,
    cost NUMERIC,
    "nextCheckupDate" DATE,
    notes TEXT,
    "createdAt" TIMESTAMP WITH TIME ZONE
);

-- Create the "vaccination_records" table
CREATE TABLE vaccination_records (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    "animalId" INT REFERENCES animals(id),
    "vaccineName" TEXT,
    "vaccineType" TEXT,
    "administrationDate" DATE,
    "nextDueDate" DATE,
    "batchNumber" TEXT,
    "veterinarianName" TEXT, -- Consider linking to a veterinarians table
    dosage TEXT,
    "administrationMethod" TEXT,
    cost NUMERIC,
    notes TEXT,
    "createdAt" TIMESTAMP WITH TIME ZONE
);

-- Create the "weight_records" table
CREATE TABLE weight_records (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    "animalId" INT REFERENCES animals(id),
    weight NUMERIC,
    date DATE,
    notes TEXT,
    "recordedBy" TEXT, -- Consider linking to a users or employees table
    "createdAt" TIMESTAMP WITH TIME ZONE
);
