"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.backupAnimals = exports.getAnimalSummary = exports.addHealthRecord = exports.getHealthRecords = exports.addVaccinationRecord = exports.getVaccinationRecords = exports.addBreedingRecord = exports.getBreedingRecords = exports.addWeightRecord = exports.getWeightRecords = exports.deleteAnimal = exports.updateAnimal = exports.addAnimal = exports.getAnimals = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const ANIMALS_FILE = path_1.default.join(process.cwd(), "src/data/animals.json");
const WEIGHT_RECORDS_FILE = path_1.default.join(process.cwd(), "src/data/weight-records.json");
const BREEDING_RECORDS_FILE = path_1.default.join(process.cwd(), "src/data/breeding-records.json");
const VACCINATION_RECORDS_FILE = path_1.default.join(process.cwd(), "src/data/vaccination-records.json");
const HEALTH_RECORDS_FILE = path_1.default.join(process.cwd(), "src/data/health-records.json");
// Ensure data directory exists
const dataDir = path_1.default.dirname(ANIMALS_FILE);
if (!fs_1.default.existsSync(dataDir)) {
    fs_1.default.mkdirSync(dataDir, { recursive: true });
}
// Helper functions for file operations
const readAnimals = () => {
    try {
        if (!fs_1.default.existsSync(ANIMALS_FILE))
            return [];
        const data = fs_1.default.readFileSync(ANIMALS_FILE, "utf8");
        return JSON.parse(data);
    }
    catch (error) {
        console.error("Error reading animals:", error);
        return [];
    }
};
const writeAnimals = (animals) => {
    try {
        fs_1.default.writeFileSync(ANIMALS_FILE, JSON.stringify(animals, null, 2));
    }
    catch (error) {
        console.error("Error writing animals:", error);
        throw error;
    }
};
const readWeightRecords = () => {
    try {
        if (!fs_1.default.existsSync(WEIGHT_RECORDS_FILE))
            return [];
        const data = fs_1.default.readFileSync(WEIGHT_RECORDS_FILE, "utf8");
        return JSON.parse(data);
    }
    catch (error) {
        console.error("Error reading weight records:", error);
        return [];
    }
};
const writeWeightRecords = (records) => {
    try {
        fs_1.default.writeFileSync(WEIGHT_RECORDS_FILE, JSON.stringify(records, null, 2));
    }
    catch (error) {
        console.error("Error writing weight records:", error);
        throw error;
    }
};
const readBreedingRecords = () => {
    try {
        if (!fs_1.default.existsSync(BREEDING_RECORDS_FILE))
            return [];
        const data = fs_1.default.readFileSync(BREEDING_RECORDS_FILE, "utf8");
        return JSON.parse(data);
    }
    catch (error) {
        console.error("Error reading breeding records:", error);
        return [];
    }
};
const writeBreedingRecords = (records) => {
    try {
        fs_1.default.writeFileSync(BREEDING_RECORDS_FILE, JSON.stringify(records, null, 2));
    }
    catch (error) {
        console.error("Error writing breeding records:", error);
        throw error;
    }
};
const readVaccinationRecords = () => {
    try {
        if (!fs_1.default.existsSync(VACCINATION_RECORDS_FILE))
            return [];
        const data = fs_1.default.readFileSync(VACCINATION_RECORDS_FILE, "utf8");
        return JSON.parse(data);
    }
    catch (error) {
        console.error("Error reading vaccination records:", error);
        return [];
    }
};
const writeVaccinationRecords = (records) => {
    try {
        fs_1.default.writeFileSync(VACCINATION_RECORDS_FILE, JSON.stringify(records, null, 2));
    }
    catch (error) {
        console.error("Error writing vaccination records:", error);
        throw error;
    }
};
const readHealthRecords = () => {
    try {
        if (!fs_1.default.existsSync(HEALTH_RECORDS_FILE))
            return [];
        const data = fs_1.default.readFileSync(HEALTH_RECORDS_FILE, "utf8");
        return JSON.parse(data);
    }
    catch (error) {
        console.error("Error reading health records:", error);
        return [];
    }
};
const writeHealthRecords = (records) => {
    try {
        fs_1.default.writeFileSync(HEALTH_RECORDS_FILE, JSON.stringify(records, null, 2));
    }
    catch (error) {
        console.error("Error writing health records:", error);
        throw error;
    }
};
// Animal CRUD operations
const getAnimals = (req, res) => {
    try {
        const animals = readAnimals();
        res.json(animals);
    }
    catch (error) {
        console.error("Error getting animals:", error);
        res.status(500).json({ error: "Failed to fetch animals" });
    }
};
exports.getAnimals = getAnimals;
const addAnimal = (req, res) => {
    try {
        const newAnimal = req.body;
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
    }
    catch (error) {
        console.error("Error adding animal:", error);
        res.status(500).json({ error: "Failed to add animal" });
    }
};
exports.addAnimal = addAnimal;
const updateAnimal = (req, res) => {
    try {
        const { id } = req.params;
        const updatedAnimal = req.body;
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
    }
    catch (error) {
        console.error("Error updating animal:", error);
        res.status(500).json({ error: "Failed to update animal" });
    }
};
exports.updateAnimal = updateAnimal;
const deleteAnimal = (req, res) => {
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
    }
    catch (error) {
        console.error("Error deleting animal:", error);
        res.status(500).json({ error: "Failed to delete animal" });
    }
};
exports.deleteAnimal = deleteAnimal;
// Weight record operations
const getWeightRecords = (req, res) => {
    try {
        const { animalId } = req.query;
        let records = readWeightRecords();
        if (animalId) {
            records = records.filter((record) => record.animalId === animalId);
        }
        res.json(records);
    }
    catch (error) {
        console.error("Error getting weight records:", error);
        res.status(500).json({ error: "Failed to fetch weight records" });
    }
};
exports.getWeightRecords = getWeightRecords;
const addWeightRecord = (req, res) => {
    try {
        const newRecord = req.body;
        newRecord.id = Date.now().toString();
        newRecord.createdAt = new Date().toISOString();
        const records = readWeightRecords();
        records.unshift(newRecord);
        writeWeightRecords(records);
        res.status(201).json(newRecord);
    }
    catch (error) {
        console.error("Error adding weight record:", error);
        res.status(500).json({ error: "Failed to add weight record" });
    }
};
exports.addWeightRecord = addWeightRecord;
// Breeding record operations
const getBreedingRecords = (req, res) => {
    try {
        const { animalId } = req.query;
        let records = readBreedingRecords();
        if (animalId) {
            records = records.filter((record) => record.motherId === animalId || record.fatherId === animalId);
        }
        res.json(records);
    }
    catch (error) {
        console.error("Error getting breeding records:", error);
        res.status(500).json({ error: "Failed to fetch breeding records" });
    }
};
exports.getBreedingRecords = getBreedingRecords;
const addBreedingRecord = (req, res) => {
    try {
        const newRecord = req.body;
        newRecord.id = Date.now().toString();
        const now = new Date().toISOString();
        newRecord.createdAt = now;
        newRecord.updatedAt = now;
        const records = readBreedingRecords();
        records.unshift(newRecord);
        writeBreedingRecords(records);
        res.status(201).json(newRecord);
    }
    catch (error) {
        console.error("Error adding breeding record:", error);
        res.status(500).json({ error: "Failed to add breeding record" });
    }
};
exports.addBreedingRecord = addBreedingRecord;
// Vaccination record operations
const getVaccinationRecords = (req, res) => {
    try {
        const { animalId } = req.query;
        let records = readVaccinationRecords();
        if (animalId) {
            records = records.filter((record) => record.animalId === animalId);
        }
        res.json(records);
    }
    catch (error) {
        console.error("Error getting vaccination records:", error);
        res.status(500).json({ error: "Failed to fetch vaccination records" });
    }
};
exports.getVaccinationRecords = getVaccinationRecords;
const addVaccinationRecord = (req, res) => {
    try {
        const newRecord = req.body;
        newRecord.id = Date.now().toString();
        newRecord.createdAt = new Date().toISOString();
        const records = readVaccinationRecords();
        records.unshift(newRecord);
        writeVaccinationRecords(records);
        res.status(201).json(newRecord);
    }
    catch (error) {
        console.error("Error adding vaccination record:", error);
        res.status(500).json({ error: "Failed to add vaccination record" });
    }
};
exports.addVaccinationRecord = addVaccinationRecord;
// Health record operations
const getHealthRecords = (req, res) => {
    try {
        const { animalId } = req.query;
        let records = readHealthRecords();
        if (animalId) {
            records = records.filter((record) => record.animalId === animalId);
        }
        res.json(records);
    }
    catch (error) {
        console.error("Error getting health records:", error);
        res.status(500).json({ error: "Failed to fetch health records" });
    }
};
exports.getHealthRecords = getHealthRecords;
const addHealthRecord = (req, res) => {
    try {
        const newRecord = req.body;
        newRecord.id = Date.now().toString();
        newRecord.createdAt = new Date().toISOString();
        const records = readHealthRecords();
        records.unshift(newRecord);
        writeHealthRecords(records);
        res.status(201).json(newRecord);
    }
    catch (error) {
        console.error("Error adding health record:", error);
        res.status(500).json({ error: "Failed to add health record" });
    }
};
exports.addHealthRecord = addHealthRecord;
// Dashboard summary
const getAnimalSummary = (req, res) => {
    try {
        const animals = readAnimals();
        const weightRecords = readWeightRecords();
        const summary = {
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
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
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
        summary.totalInvestment = animals.reduce((sum, animal) => sum + (animal.purchasePrice || 0), 0);
        summary.totalRevenue = animals
            .filter((a) => a.status === "sold")
            .reduce((sum, animal) => sum + (animal.salePrice || 0), 0);
        summary.profitLoss = summary.totalRevenue - summary.totalInvestment;
        res.json(summary);
    }
    catch (error) {
        console.error("Error getting animal summary:", error);
        res.status(500).json({ error: "Failed to fetch animal summary" });
    }
};
exports.getAnimalSummary = getAnimalSummary;
// Backup and import operations
const backupAnimals = (req, res) => {
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
        res.setHeader("Content-Disposition", `attachment; filename="${backupFileName}"`);
        res.json(backup);
    }
    catch (error) {
        console.error("Error creating backup:", error);
        res.status(500).json({ error: "Failed to create backup" });
    }
};
exports.backupAnimals = backupAnimals;
//# sourceMappingURL=animals.js.map