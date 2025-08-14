-- Supabase Migration Script for Aura Haven Farm Management
-- Execute this in Supabase SQL Editor to create all required tables

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Animals table
CREATE TABLE IF NOT EXISTS animals (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('goat', 'sheep', 'cow', 'buffalo')),
  breed VARCHAR(100),
  gender VARCHAR(10) NOT NULL CHECK (gender IN ('male', 'female')),
  date_of_birth DATE,
  photos TEXT[], -- Array of photo URLs
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'sold', 'dead', 'ready_to_sell')),
  current_weight DECIMAL(8,2),
  markings TEXT,
  purchase_date DATE,
  purchase_price DECIMAL(10,2),
  purchase_location VARCHAR(255),
  previous_owner VARCHAR(255),
  insured BOOLEAN DEFAULT FALSE,
  insurance_provider VARCHAR(255),
  insurance_policy_number VARCHAR(100),
  insurance_amount DECIMAL(10,2),
  insurance_expiry_date DATE,
  sale_date DATE,
  sale_price DECIMAL(10,2),
  buyer_name VARCHAR(255),
  sale_notes TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Weight records table
CREATE TABLE IF NOT EXISTS weight_records (
  id SERIAL PRIMARY KEY,
  animal_id INTEGER NOT NULL REFERENCES animals(id) ON DELETE CASCADE,
  weight DECIMAL(8,2) NOT NULL,
  date DATE NOT NULL,
  notes TEXT,
  recorded_by VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Breeding records table
CREATE TABLE IF NOT EXISTS breeding_records (
  id SERIAL PRIMARY KEY,
  mother_id INTEGER NOT NULL REFERENCES animals(id) ON DELETE CASCADE,
  father_id INTEGER REFERENCES animals(id) ON DELETE SET NULL,
  breeding_date DATE NOT NULL,
  expected_delivery_date DATE,
  actual_delivery_date DATE,
  total_kids INTEGER DEFAULT 0,
  male_kids INTEGER DEFAULT 0,
  female_kids INTEGER DEFAULT 0,
  kid_details JSONB, -- Store array of kid information
  breeding_method VARCHAR(50) CHECK (breeding_method IN ('natural', 'artificial')),
  veterinarian_name VARCHAR(255),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Health records table
CREATE TABLE IF NOT EXISTS health_records (
  id SERIAL PRIMARY KEY,
  animal_id INTEGER NOT NULL REFERENCES animals(id) ON DELETE CASCADE,
  record_type VARCHAR(50) NOT NULL CHECK (record_type IN ('checkup', 'treatment', 'surgery', 'emergency')),
  date DATE NOT NULL,
  description TEXT NOT NULL,
  veterinarian_name VARCHAR(255),
  diagnosis TEXT,
  treatment TEXT,
  medications TEXT,
  cost DECIMAL(10,2),
  next_checkup_date DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Vaccination records table
CREATE TABLE IF NOT EXISTS vaccination_records (
  id SERIAL PRIMARY KEY,
  animal_id INTEGER NOT NULL REFERENCES animals(id) ON DELETE CASCADE,
  vaccine_name VARCHAR(255) NOT NULL,
  vaccine_type VARCHAR(100),
  administration_date DATE NOT NULL,
  next_due_date DATE,
  batch_number VARCHAR(100),
  veterinarian_name VARCHAR(255),
  dosage VARCHAR(50),
  administration_method VARCHAR(50) CHECK (administration_method IN ('injection', 'oral', 'nasal', 'topical')),
  cost DECIMAL(10,2),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tasks table  
CREATE TABLE IF NOT EXISTS tasks (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100) NOT NULL,
  task_type VARCHAR(100),
  priority VARCHAR(10) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in-progress', 'completed')),
  due_date DATE NOT NULL,
  assigned_to VARCHAR(255) NOT NULL,
  notes TEXT,
  reminder_sent BOOLEAN DEFAULT FALSE,
  completed_at DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Update the existing categories table to ensure proper structure
CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  sub_categories TEXT[], -- Array of subcategory names
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Update the existing expenses table to ensure proper structure
CREATE TABLE IF NOT EXISTS expenses (
  id SERIAL PRIMARY KEY,
  description TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  type VARCHAR(50) DEFAULT 'Expense',
  date DATE NOT NULL,
  paid_by VARCHAR(255),
  category_id INTEGER REFERENCES categories(id),
  sub_category VARCHAR(255),
  source VARCHAR(255),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create view for expenses with category names (for backward compatibility)
CREATE OR REPLACE VIEW allexpenses AS
SELECT 
  e.id,
  e.description,
  e.amount,
  e.type,
  e.date,
  e.paid_by as "paidBy",
  c.name as category,
  e.sub_category as "subCategory", 
  e.source,
  e.notes,
  e.created_at,
  e.updated_at
FROM expenses e
LEFT JOIN categories c ON e.category_id = c.id;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_animals_type ON animals(type);
CREATE INDEX IF NOT EXISTS idx_animals_status ON animals(status);
CREATE INDEX IF NOT EXISTS idx_weight_records_animal_id ON weight_records(animal_id);
CREATE INDEX IF NOT EXISTS idx_weight_records_date ON weight_records(date);
CREATE INDEX IF NOT EXISTS idx_breeding_records_mother_id ON breeding_records(mother_id);
CREATE INDEX IF NOT EXISTS idx_breeding_records_father_id ON breeding_records(father_id);
CREATE INDEX IF NOT EXISTS idx_health_records_animal_id ON health_records(animal_id);
CREATE INDEX IF NOT EXISTS idx_vaccination_records_animal_id ON vaccination_records(animal_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_expenses_category_id ON expenses(category_id);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date);

-- Create triggers to automatically update updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_animals_updated_at BEFORE UPDATE ON animals FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_breeding_records_updated_at BEFORE UPDATE ON breeding_records FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_expenses_updated_at BEFORE UPDATE ON expenses FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Enable Row Level Security (RLS) if needed
-- ALTER TABLE animals ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE weight_records ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE breeding_records ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE health_records ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE vaccination_records ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Insert basic categories if they don't exist
INSERT INTO categories (name, sub_categories) VALUES 
('Feed', ARRAY['Grass', 'Grain', 'Supplements', 'Hay']) ON CONFLICT (name) DO NOTHING;
INSERT INTO categories (name, sub_categories) VALUES 
('Medical', ARRAY['Veterinary', 'Medicines', 'Vaccines', 'Treatment']) ON CONFLICT (name) DO NOTHING;
INSERT INTO categories (name, sub_categories) VALUES 
('Infrastructure', ARRAY['Construction', 'Repairs', 'Equipment', 'Tools']) ON CONFLICT (name) DO NOTHING;
INSERT INTO categories (name, sub_categories) VALUES 
('Labor', ARRAY['Wages', 'Contract', 'Overtime', 'Bonus']) ON CONFLICT (name) DO NOTHING;
INSERT INTO categories (name, sub_categories) VALUES 
('Utilities', ARRAY['Electricity', 'Water', 'Internet', 'Phone']) ON CONFLICT (name) DO NOTHING;
INSERT INTO categories (name, sub_categories) VALUES 
('Transportation', ARRAY['Fuel', 'Vehicle Maintenance', 'Travel', 'Shipping']) ON CONFLICT (name) DO NOTHING;
INSERT INTO categories (name, sub_categories) VALUES 
('Other', ARRAY['Miscellaneous', 'Emergency', 'Insurance', 'Legal']) ON CONFLICT (name) DO NOTHING;
