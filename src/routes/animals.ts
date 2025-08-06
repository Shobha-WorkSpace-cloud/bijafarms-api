import { RequestHandler } from "express";
import fs from "fs";
import path from "path";
import {
  AnimalRecord,
  WeightRecord,
  BreedingRecord,
  VaccinationRecord,
  HealthRecord,
  AnimalSummary,
} from "@shared/animal-types";
const ANIMALS_FILE = path.join(process.cwd(), "src/data/animals.json");
const WEIGHT_RECORDS_FILE = path.join(
  process.cwd(),
  "src/data/weight-records.json",
);
const BREEDING_RECORDS_FILE = path.join(
  process.cwd(),
  "src/data/breeding-records.json",
);
const VACCINATION_RECORDS_FILE = path.join(
  process.cwd(),
  "src/data/vaccination-records.json",
);
const HEALTH_RECORDS_FILE = path.join(
  process.cwd(),
  "src/data/health-records.json",
);

// Ensure data directory exists
const dataDir = path.dirname(ANIMALS_FILE);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Helper functions for file operations
const readAnimals = (): AnimalRecord[] => {
  try {
    if (!fs.existsSync(ANIMALS_FILE)) return [];
    const data = fs.readFileSync(ANIMALS_FILE, "utf8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading animals:", error);
    return [];
  }
};

const writeAnimals = (animals: AnimalRecord[]): void => {
  try {
    fs.writeFileSync(ANIMALS_FILE, JSON.stringify(animals, null, 2));
  } catch (error) {
    console.error("Error writing animals:", error);
    throw error;
  }
};

const readWeightRecords = (): WeightRecord[] => {
  try {
    if (!fs.existsSync(WEIGHT_RECORDS_FILE)) return [];
    const data = fs.readFileSync(WEIGHT_RECORDS_FILE, "utf8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading weight records:", error);
    return [];
  }
};

const writeWeightRecords = (records: WeightRecord[]): void => {
  try {
    fs.writeFileSync(WEIGHT_RECORDS_FILE, JSON.stringify(records, null, 2));
  } catch (error) {
    console.error("Error writing weight records:", error);
    throw error;
  }
};

const readBreedingRecords = (): BreedingRecord[] => {
  try {
    if (!fs.existsSync(BREEDING_RECORDS_FILE)) return [];
    const data = fs.readFileSync(BREEDING_RECORDS_FILE, "utf8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading breeding records:", error);
    return [];
  }
};

const writeBreedingRecords = (records: BreedingRecord[]): void => {
  try {
    fs.writeFileSync(BREEDING_RECORDS_FILE, JSON.stringify(records, null, 2));
  } catch (error) {
    console.error("Error writing breeding records:", error);
    throw error;
  }
};

const readVaccinationRecords = (): VaccinationRecord[] => {
  try {
    if (!fs.existsSync(VACCINATION_RECORDS_FILE)) return [];
    const data = fs.readFileSync(VACCINATION_RECORDS_FILE, "utf8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading vaccination records:", error);
    return [];
  }
};

const writeVaccinationRecords = (records: VaccinationRecord[]): void => {
  try {
    fs.writeFileSync(
      VACCINATION_RECORDS_FILE,
      JSON.stringify(records, null, 2),
    );
  } catch (error) {
    console.error("Error writing vaccination records:", error);
    throw error;
  }
};

const readHealthRecords = (): HealthRecord[] => {
  try {
    if (!fs.existsSync(HEALTH_RECORDS_FILE)) return [];
    const data = fs.readFileSync(HEALTH_RECORDS_FILE, "utf8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading health records:", error);
    return [];
  }
};

const writeHealthRecords = (records: HealthRecord[]): void => {
  try {
    fs.writeFileSync(HEALTH_RECORDS_FILE, JSON.stringify(records, null, 2));
  } catch (error) {
    console.error("Error writing health records:", error);
    throw error;
  }
};

// Animal CRUD operations
export const getAnimals: RequestHandler = (req, res) => {
  try {
    const animals = readAnimals();
    res.json(animals);
  } catch (error) {
    console.error("Error getting animals:", error);
    res.status(500).json({ error: "Failed to fetch animals" });
  }
};

export const addAnimal: RequestHandler = (req, res) => {
  try {
    const newAnimal: AnimalRecord = req.body;

    // Generate ID if not provided
    if (!newAnimal.id) {
      const animals = readAnimals();
      let maxId = 0;
      animals.forEach((animal) => {
        const numId = parseInt(animal.id);
        if (!isNaN(numId) && numId > maxId) {
          maxId = numId;
        }
      });
      newAnimal.id = (maxId + 1).toString();
    }

    // Set timestamps
    const now = new Date().toISOString();
    newAnimal.createdAt = now;
    newAnimal.updatedAt = now;

    const animals = readAnimals();
    animals.unshift(newAnimal);
    writeAnimals(animals);

    res.status(201).json(newAnimal);
  } catch (error) {
    console.error("Error adding animal:", error);
    res.status(500).json({ error: "Failed to add animal" });
  }
};

export const updateAnimal: RequestHandler = (req, res) => {
  try {
    const { id } = req.params;
    const updatedAnimal: AnimalRecord = req.body;

    const animals = readAnimals();
    const index = animals.findIndex((animal) => animal.id === id);

    if (index === -1) {
      return res.status(404).json({ error: "Animal not found" });
    }

    // Preserve created date and update modified date
    updatedAnimal.createdAt = animals[index].createdAt;
    updatedAnimal.updatedAt = new Date().toISOString();
    updatedAnimal.id = id;

    animals[index] = updatedAnimal;
    writeAnimals(animals);

    res.json(animals[index]);
  } catch (error) {
    console.error("Error updating animal:", error);
    res.status(500).json({ error: "Failed to update animal" });
  }
};

export const deleteAnimal: RequestHandler = (req, res) => {
  try {
    const { id } = req.params;

    const animals = readAnimals();
    const index = animals.findIndex((animal) => animal.id === id);

    if (index === -1) {
      return res.status(404).json({ error: "Animal not found" });
    }

    animals.splice(index, 1);
    writeAnimals(animals);

    res.json({ message: "Animal deleted successfully" });
  } catch (error) {
    console.error("Error deleting animal:", error);
    res.status(500).json({ error: "Failed to delete animal" });
  }
};

// Weight record operations
export const getWeightRecords: RequestHandler = (req, res) => {
  try {
    const { animalId } = req.query;
    let records = readWeightRecords();

    if (animalId) {
      records = records.filter((record) => record.animalId === animalId);
    }

    res.json(records);
  } catch (error) {
    console.error("Error getting weight records:", error);
    res.status(500).json({ error: "Failed to fetch weight records" });
  }
};

export const addWeightRecord: RequestHandler = (req, res) => {
  try {
    const newRecord: WeightRecord = req.body;
    newRecord.id = Date.now().toString();
    newRecord.createdAt = new Date().toISOString();

    const records = readWeightRecords();
    records.unshift(newRecord);
    writeWeightRecords(records);

    res.status(201).json(newRecord);
  } catch (error) {
    console.error("Error adding weight record:", error);
    res.status(500).json({ error: "Failed to add weight record" });
  }
};

// Breeding record operations
export const getBreedingRecords: RequestHandler = (req, res) => {
  try {
    const { animalId } = req.query;
    let records = readBreedingRecords();

    if (animalId) {
      records = records.filter(
        (record) =>
          record.motherId === animalId || record.fatherId === animalId,
      );
    }

    res.json(records);
  } catch (error) {
    console.error("Error getting breeding records:", error);
    res.status(500).json({ error: "Failed to fetch breeding records" });
  }
};

export const addBreedingRecord: RequestHandler = (req, res) => {
  try {
    const newRecord: BreedingRecord = req.body;
    newRecord.id = Date.now().toString();
    const now = new Date().toISOString();
    newRecord.createdAt = now;
    newRecord.updatedAt = now;

    const records = readBreedingRecords();
    records.unshift(newRecord);
    writeBreedingRecords(records);

    res.status(201).json(newRecord);
  } catch (error) {
    console.error("Error adding breeding record:", error);
    res.status(500).json({ error: "Failed to add breeding record" });
  }
};

// Vaccination record operations
export const getVaccinationRecords: RequestHandler = (req, res) => {
  try {
    const { animalId } = req.query;
    let records = readVaccinationRecords();

    if (animalId) {
      records = records.filter((record) => record.animalId === animalId);
    }

    res.json(records);
  } catch (error) {
    console.error("Error getting vaccination records:", error);
    res.status(500).json({ error: "Failed to fetch vaccination records" });
  }
};

export const addVaccinationRecord: RequestHandler = (req, res) => {
  try {
    const newRecord: VaccinationRecord = req.body;
    newRecord.id = Date.now().toString();
    newRecord.createdAt = new Date().toISOString();

    const records = readVaccinationRecords();
    records.unshift(newRecord);
    writeVaccinationRecords(records);

    res.status(201).json(newRecord);
  } catch (error) {
    console.error("Error adding vaccination record:", error);
    res.status(500).json({ error: "Failed to add vaccination record" });
  }
};

// Health record operations
export const getHealthRecords: RequestHandler = (req, res) => {
  try {
    const { animalId } = req.query;
    let records = readHealthRecords();

    if (animalId) {
      records = records.filter((record) => record.animalId === animalId);
    }

    res.json(records);
  } catch (error) {
    console.error("Error getting health records:", error);
    res.status(500).json({ error: "Failed to fetch health records" });
  }
};

export const addHealthRecord: RequestHandler = (req, res) => {
  try {
    const newRecord: HealthRecord = req.body;
    newRecord.id = Date.now().toString();
    newRecord.createdAt = new Date().toISOString();

    const records = readHealthRecords();
    records.unshift(newRecord);
    writeHealthRecords(records);

    res.status(201).json(newRecord);
  } catch (error) {
    console.error("Error adding health record:", error);
    res.status(500).json({ error: "Failed to add health record" });
  }
};

// Dashboard summary
export const getAnimalSummary: RequestHandler = (req, res) => {
  try {
    const animals = readAnimals();
    const weightRecords = readWeightRecords();

    const summary: AnimalSummary = {
      totalAnimals: animals.length,
      totalGoats: animals.filter((a) => a.type === "goat").length,
      totalSheep: animals.filter((a) => a.type === "sheep").length,
      totalMales: animals.filter((a) => a.gender === "male").length,
      totalFemales: animals.filter((a) => a.gender === "female").length,
      activeAnimals: animals.filter((a) => a.status === "active").length,
      soldAnimals: animals.filter((a) => a.status === "sold").length,
      readyToSell: animals.filter((a) => a.status === "ready_to_sell").length,
      deadAnimals: animals.filter((a) => a.status === "dead").length,
      averageWeight: 0,
      totalInvestment: 0,
      totalRevenue: 0,
      profitLoss: 0,
    };

    // Calculate average weight from most recent weight records
    const animalWeights = animals
      .map((animal) => {
        const animalWeightRecords = weightRecords
          .filter((w) => w.animalId === animal.id)
          .sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
          );

        return animalWeightRecords.length > 0
          ? animalWeightRecords[0].weight
          : animal.currentWeight || 0;
      })
      .filter((weight) => weight > 0);

    if (animalWeights.length > 0) {
      summary.averageWeight =
        animalWeights.reduce((sum, weight) => sum + weight, 0) /
        animalWeights.length;
    }

    // Calculate financial summary
    summary.totalInvestment = animals.reduce(
      (sum, animal) => sum + (animal.purchasePrice || 0),
      0,
    );
    summary.totalRevenue = animals
      .filter((a) => a.status === "sold")
      .reduce((sum, animal) => sum + (animal.salePrice || 0), 0);
    summary.profitLoss = summary.totalRevenue - summary.totalInvestment;

    res.json(summary);
  } catch (error) {
    console.error("Error getting animal summary:", error);
    res.status(500).json({ error: "Failed to fetch animal summary" });
  }
};

// Backup and import operations
export const backupAnimals: RequestHandler = (req, res) => {
  try {
    const animals = readAnimals();
    const weightRecords = readWeightRecords();
    const breedingRecords = readBreedingRecords();
    const vaccinationRecords = readVaccinationRecords();
    const healthRecords = readHealthRecords();

    const backup = {
      animals,
      weightRecords,
      breedingRecords,
      vaccinationRecords,
      healthRecords,
      exportDate: new Date().toISOString(),
    };

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const backupFileName = `animals-backup-${timestamp}.json`;

    res.setHeader("Content-Type", "application/json");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${backupFileName}"`,
    );
    res.json(backup);
  } catch (error) {
    console.error("Error creating backup:", error);
    res.status(500).json({ error: "Failed to create backup" });
  }
};
