"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.backupAnimals = exports.getAnimalSummary = exports.addHealthRecord = exports.getHealthRecords = exports.addVaccinationRecord = exports.getVaccinationRecords = exports.addBreedingRecord = exports.getBreedingRecords = exports.addWeightRecord = exports.getWeightRecords = exports.deleteAnimal = exports.updateAnimal = exports.addAnimal = exports.getAnimals = void 0;
const supabaseClient_1 = __importDefault(require("./supabaseClient"));
// Helper functions for database operations
const readAnimals = async () => {
    try {
        const { data: animals, error } = await supabaseClient_1.default
            .from('animals')
            .select('*')
            .order('id', { ascending: false });
        if (error) {
            console.error("Supabase error:", error);
            return [];
        }
        return animals?.map(animal => ({
            id: animal.id.toString(),
            name: animal.name,
            type: animal.type,
            breed: animal.breed,
            gender: animal.gender,
            dateOfBirth: animal.dateOfBirth,
            photos: animal.photos || [],
            status: animal.status,
            currentWeight: animal.currentWeight,
            markings: animal.markings,
            purchaseDate: animal.purchaseDate,
            purchasePrice: animal.purchasePrice,
            purchaseLocation: animal.purchaseLocation,
            previousOwner: animal.previousOwner,
            insured: animal.insured,
            insuranceProvider: animal.insuranceProvider,
            insurancePolicyNumber: animal.insurancePolicyNumber,
            insuranceAmount: animal.insuranceAmount,
            insuranceExpiryDate: animal.insuranceExpiryDate,
            saleDate: animal.saleDate,
            salePrice: animal.salePrice,
            buyerName: animal.buyerName,
            saleNotes: animal.saleNotes,
            notes: animal.notes,
            createdAt: animal.createdAt,
            updatedAt: animal.updatedAt
        })) || [];
    }
    catch (error) {
        console.error("Error reading animals:", error);
        return [];
    }
};
const readWeightRecords = async (animalId) => {
    try {
        let query = supabaseClient_1.default
            .from('weight_records')
            .select('*')
            .order('date', { ascending: false });
        if (animalId) {
            query = query.eq('animalId', parseInt(animalId));
        }
        const { data: records, error } = await query;
        if (error) {
            console.error("Supabase error:", error);
            return [];
        }
        return records?.map(record => ({
            id: record.id.toString(),
            animalId: record.animalId.toString(),
            weight: record.weight,
            date: record.date,
            notes: record.notes,
            recordedBy: record.recordedBy,
            createdAt: record.createdAt
        })) || [];
    }
    catch (error) {
        console.error("Error reading weight records:", error);
        return [];
    }
};
const readBreedingRecords = async (animalId) => {
    try {
        let query = supabaseClient_1.default
            .from('breeding_records')
            .select('*')
            .order('breedingDate', { ascending: false });
        if (animalId) {
            query = query.or(`motherId.eq.${animalId},fatherId.eq.${animalId}`);
        }
        const { data: records, error } = await query;
        if (error) {
            console.error("Supabase error:", error);
            return [];
        }
        return records?.map(record => ({
            id: record.id.toString(),
            motherId: record.motherId?.toString(),
            fatherId: record.fatherId?.toString(),
            breedingDate: record.breedingDate,
            expectedDeliveryDate: record.expectedDeliveryDate,
            actualDeliveryDate: record.actualDeliveryDate,
            totalKids: record.totalKids,
            maleKids: record.maleKids,
            femaleKids: record.femaleKids,
            kidDetails: record.kid_details,
            breedingMethod: record.breedingMethod,
            veterinarianName: record.veterinarianName,
            notes: record.notes,
            createdAt: record.createdAt,
            updatedAt: record.updatedAt
        })) || [];
    }
    catch (error) {
        console.error("Error reading breeding records:", error);
        return [];
    }
};
const readVaccinationRecords = async (animalId) => {
    try {
        let query = supabaseClient_1.default
            .from('vaccination_records')
            .select('*')
            .order('administrationDate', { ascending: false });
        if (animalId) {
            query = query.eq('animalId', parseInt(animalId));
        }
        const { data: records, error } = await query;
        if (error) {
            console.error("Supabase error:", error);
            return [];
        }
        return records?.map(record => ({
            id: record.id.toString(),
            animalId: record.animalId.toString(),
            vaccineName: record.vaccineName,
            vaccineType: record.vaccineType,
            administrationDate: record.administrationDate,
            nextDueDate: record.nextDueDate,
            batchNumber: record.batchNumber,
            veterinarianName: record.veterinarianName,
            dosage: record.dosage,
            administrationMethod: record.administrationMethod,
            cost: record.cost,
            notes: record.notes,
            createdAt: record.createdAt
        })) || [];
    }
    catch (error) {
        console.error("Error reading vaccination records:", error);
        return [];
    }
};
const readHealthRecords = async (animalId) => {
    try {
        let query = supabaseClient_1.default
            .from('health_records')
            .select('*')
            .order('date', { ascending: false });
        if (animalId) {
            query = query.eq('animalId', parseInt(animalId));
        }
        const { data: records, error } = await query;
        if (error) {
            console.error("Supabase error:", error);
            return [];
        }
        return records?.map(record => ({
            id: record.id.toString(),
            animalId: record.animalId.toString(),
            recordType: record.recordType,
            date: record.date,
            description: record.description,
            veterinarianName: record.veterinarianName,
            diagnosis: record.diagnosis,
            treatment: record.treatment,
            medications: record.medications,
            cost: record.cost,
            nextCheckupDate: record.nextCheckupDate,
            notes: record.notes,
            createdAt: record.createdAt
        })) || [];
    }
    catch (error) {
        console.error("Error reading health records:", error);
        return [];
    }
};
// Animal CRUD operations
const getAnimals = async (req, res) => {
    try {
        const animals = await readAnimals();
        res.json(animals);
    }
    catch (error) {
        console.error("Error getting animals:", error);
        res.status(500).json({ error: "Failed to fetch animals" });
    }
};
exports.getAnimals = getAnimals;
const addAnimal = async (req, res) => {
    try {
        const newAnimal = req.body;
        // Prepare animal data for Supabase
        const animalData = {
            name: newAnimal.name,
            type: newAnimal.type,
            breed: newAnimal.breed,
            gender: newAnimal.gender,
            dateOfBirth: newAnimal.dateOfBirth,
            photos: newAnimal.photos || [],
            status: newAnimal.status || 'active',
            currentWeight: newAnimal.currentWeight,
            markings: newAnimal.markings,
            purchaseDate: newAnimal.purchaseDate,
            purchasePrice: newAnimal.purchasePrice,
            purchaseLocation: newAnimal.purchaseLocation,
            previousOwner: newAnimal.previousOwner,
            insured: newAnimal.insured || false,
            insuranceProvider: newAnimal.insuranceProvider,
            insurancePolicyNumber: newAnimal.insurancePolicyNumber,
            insuranceAmount: newAnimal.insuranceAmount,
            insuranceExpiryDate: newAnimal.insuranceExpiryDate,
            notes: newAnimal.notes
        };
        const { data, error } = await supabaseClient_1.default
            .from('animals')
            .insert([animalData])
            .select()
            .single();
        if (error) {
            console.error("Supabase insert error:", error);
            throw error;
        }
        // Transform back to expected format
        const returnAnimal = {
            id: data.id.toString(),
            name: data.name,
            type: data.type,
            breed: data.breed,
            gender: data.gender,
            dateOfBirth: data.dateOfBirth,
            photos: data.photos || [],
            status: data.status,
            currentWeight: data.currentWeight,
            markings: data.markings,
            purchaseDate: data.purchaseDate,
            purchasePrice: data.purchasePrice,
            purchaseLocation: data.purchaseLocation,
            previousOwner: data.previousOwner,
            insured: data.insured,
            insuranceProvider: data.insuranceProvider,
            insurancePolicyNumber: data.insurancePolicyNumber,
            insuranceAmount: data.insuranceAmount,
            insuranceExpiryDate: data.insuranceExpiryDate,
            notes: data.notes,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt
        };
        res.status(201).json(returnAnimal);
    }
    catch (error) {
        console.error("Error adding animal:", error);
        res.status(500).json({ error: "Failed to add animal" });
    }
};
exports.addAnimal = addAnimal;
const updateAnimal = async (req, res) => {
    try {
        const { id } = req.params;
        const updatedAnimal = req.body;
        // Prepare update data
        const updateData = {
            name: updatedAnimal.name,
            type: updatedAnimal.type,
            breed: updatedAnimal.breed,
            gender: updatedAnimal.gender,
            dateOfBirth: updatedAnimal.dateOfBirth,
            photos: updatedAnimal.photos || [],
            status: updatedAnimal.status,
            currentWeight: updatedAnimal.currentWeight,
            markings: updatedAnimal.markings,
            purchaseDate: updatedAnimal.purchaseDate,
            purchasePrice: updatedAnimal.purchasePrice,
            purchaseLocation: updatedAnimal.purchaseLocation,
            previousOwner: updatedAnimal.previousOwner,
            insured: updatedAnimal.insured,
            insuranceProvider: updatedAnimal.insuranceProvider,
            insurancePolicyNumber: updatedAnimal.insurancePolicyNumber,
            insuranceAmount: updatedAnimal.insuranceAmount,
            insuranceExpiryDate: updatedAnimal.insuranceExpiryDate,
            saleDate: updatedAnimal.saleDate,
            salePrice: updatedAnimal.salePrice,
            buyerName: updatedAnimal.buyerName,
            saleNotes: updatedAnimal.saleNotes,
            notes: updatedAnimal.notes
        };
        const { data, error } = await supabaseClient_1.default
            .from('animals')
            .update(updateData)
            .eq('id', parseInt(id))
            .select()
            .single();
        if (error) {
            if (error.code === 'PGRST116') {
                return res.status(404).json({ error: "Animal not found" });
            }
            console.error("Supabase update error:", error);
            throw error;
        }
        // Transform back to expected format
        const returnAnimal = {
            id: data.id.toString(),
            name: data.name,
            type: data.type,
            breed: data.breed,
            gender: data.gender,
            dateOfBirth: data.dateOfBirth,
            photos: data.photos || [],
            status: data.status,
            currentWeight: data.currentWeight,
            markings: data.markings,
            purchaseDate: data.purchaseDate,
            purchasePrice: data.purchasePrice,
            purchaseLocation: data.purchaseLocation,
            previousOwner: data.previousOwner,
            insured: data.insured,
            insuranceProvider: data.insuranceProvider,
            insurancePolicyNumber: data.insurancePolicyNumber,
            insuranceAmount: data.insuranceAmount,
            insuranceExpiryDate: data.insuranceExpiryDate,
            saleDate: data.saleDate,
            salePrice: data.salePrice,
            buyerName: data.buyerName,
            saleNotes: data.saleNotes,
            notes: data.notes,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt
        };
        res.json(returnAnimal);
    }
    catch (error) {
        console.error("Error updating animal:", error);
        res.status(500).json({ error: "Failed to update animal" });
    }
};
exports.updateAnimal = updateAnimal;
const deleteAnimal = async (req, res) => {
    try {
        const { id } = req.params;
        const { error } = await supabaseClient_1.default
            .from('animals')
            .delete()
            .eq('id', parseInt(id));
        if (error) {
            console.error("Supabase delete error:", error);
            throw error;
        }
        res.json({ message: "Animal deleted successfully" });
    }
    catch (error) {
        console.error("Error deleting animal:", error);
        res.status(500).json({ error: "Failed to delete animal" });
    }
};
exports.deleteAnimal = deleteAnimal;
// Weight record operations
const getWeightRecords = async (req, res) => {
    try {
        const { animalId } = req.query;
        const records = await readWeightRecords(animalId);
        res.json(records);
    }
    catch (error) {
        console.error("Error getting weight records:", error);
        res.status(500).json({ error: "Failed to fetch weight records" });
    }
};
exports.getWeightRecords = getWeightRecords;
const addWeightRecord = async (req, res) => {
    try {
        const newRecord = req.body;
        const recordData = {
            animalId: parseInt(newRecord.animalId),
            weight: newRecord.weight,
            date: newRecord.date,
            notes: newRecord.notes,
            recordedBy: newRecord.recordedBy
        };
        const { data, error } = await supabaseClient_1.default
            .from('weight_records')
            .insert([recordData])
            .select()
            .single();
        if (error) {
            console.error("Supabase insert error:", error);
            throw error;
        }
        const returnRecord = {
            id: data.id.toString(),
            animalId: data.animalId.toString(),
            weight: data.weight,
            date: data.date,
            notes: data.notes,
            recordedBy: data.recordedBy,
            createdAt: data.createdAt
        };
        res.status(201).json(returnRecord);
    }
    catch (error) {
        console.error("Error adding weight record:", error);
        res.status(500).json({ error: "Failed to add weight record" });
    }
};
exports.addWeightRecord = addWeightRecord;
// Breeding record operations
const getBreedingRecords = async (req, res) => {
    try {
        const { animalId } = req.query;
        const records = await readBreedingRecords(animalId);
        res.json(records);
    }
    catch (error) {
        console.error("Error getting breeding records:", error);
        res.status(500).json({ error: "Failed to fetch breeding records" });
    }
};
exports.getBreedingRecords = getBreedingRecords;
const addBreedingRecord = async (req, res) => {
    try {
        const newRecord = req.body;
        const recordData = {
            motherId: parseInt(newRecord.motherId),
            fatherId: newRecord.fatherId ? parseInt(newRecord.fatherId) : null,
            breedingDate: newRecord.breedingDate,
            expectedDeliveryDate: newRecord.expectedDeliveryDate,
            actualDeliveryDate: newRecord.actualDeliveryDate,
            totalKids: newRecord.totalKids,
            maleKids: newRecord.maleKids,
            femaleKids: newRecord.femaleKids,
            kid_details: newRecord.kidDetails,
            breedingMethod: newRecord.breedingMethod,
            veterinarianName: newRecord.veterinarianName,
            notes: newRecord.notes
        };
        const { data, error } = await supabaseClient_1.default
            .from('breeding_records')
            .insert([recordData])
            .select()
            .single();
        if (error) {
            console.error("Supabase insert error:", error);
            throw error;
        }
        const returnRecord = {
            id: data.id.toString(),
            motherId: data.motherId?.toString(),
            fatherId: data.fatherId?.toString(),
            breedingDate: data.breedingDate,
            expectedDeliveryDate: data.expectedDeliveryDate,
            actualDeliveryDate: data.actualDeliveryDate,
            totalKids: data.totalKids,
            maleKids: data.maleKids,
            femaleKids: data.femaleKids,
            kidDetails: data.kid_details,
            breedingMethod: data.breedingMethod,
            veterinarianName: data.veterinarianName,
            notes: data.notes,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt
        };
        res.status(201).json(returnRecord);
    }
    catch (error) {
        console.error("Error adding breeding record:", error);
        res.status(500).json({ error: "Failed to add breeding record" });
    }
};
exports.addBreedingRecord = addBreedingRecord;
// Vaccination record operations
const getVaccinationRecords = async (req, res) => {
    try {
        const { animalId } = req.query;
        const records = await readVaccinationRecords(animalId);
        res.json(records);
    }
    catch (error) {
        console.error("Error getting vaccination records:", error);
        res.status(500).json({ error: "Failed to fetch vaccination records" });
    }
};
exports.getVaccinationRecords = getVaccinationRecords;
const addVaccinationRecord = async (req, res) => {
    try {
        const newRecord = req.body;
        const recordData = {
            animalId: parseInt(newRecord.animalId),
            vaccineName: newRecord.vaccineName,
            vaccineType: newRecord.vaccineType,
            administrationDate: newRecord.administrationDate,
            nextDueDate: newRecord.nextDueDate,
            batchNumber: newRecord.batchNumber,
            veterinarianName: newRecord.veterinarianName,
            dosage: newRecord.dosage,
            administrationMethod: newRecord.administrationMethod,
            cost: newRecord.cost,
            notes: newRecord.notes
        };
        const { data, error } = await supabaseClient_1.default
            .from('vaccination_records')
            .insert([recordData])
            .select()
            .single();
        if (error) {
            console.error("Supabase insert error:", error);
            throw error;
        }
        const returnRecord = {
            id: data.id.toString(),
            animalId: data.animalId.toString(),
            vaccineName: data.vaccineName,
            vaccineType: data.vaccineType,
            administrationDate: data.administrationDate,
            nextDueDate: data.nextDueDate,
            batchNumber: data.batchNumber,
            veterinarianName: data.veterinarianName,
            dosage: data.dosage,
            administrationMethod: data.administrationMethod,
            cost: data.cost,
            notes: data.notes,
            createdAt: data.createdAt
        };
        res.status(201).json(returnRecord);
    }
    catch (error) {
        console.error("Error adding vaccination record:", error);
        res.status(500).json({ error: "Failed to add vaccination record" });
    }
};
exports.addVaccinationRecord = addVaccinationRecord;
// Health record operations
const getHealthRecords = async (req, res) => {
    try {
        const { animalId } = req.query;
        const records = await readHealthRecords(animalId);
        res.json(records);
    }
    catch (error) {
        console.error("Error getting health records:", error);
        res.status(500).json({ error: "Failed to fetch health records" });
    }
};
exports.getHealthRecords = getHealthRecords;
const addHealthRecord = async (req, res) => {
    try {
        const newRecord = req.body;
        const recordData = {
            animalId: parseInt(newRecord.animalId),
            recordType: newRecord.recordType,
            date: newRecord.date,
            description: newRecord.description,
            veterinarianName: newRecord.veterinarianName,
            diagnosis: newRecord.diagnosis,
            treatment: newRecord.treatment,
            medications: newRecord.medications,
            cost: newRecord.cost,
            nextCheckupDate: newRecord.nextCheckupDate,
            notes: newRecord.notes
        };
        const { data, error } = await supabaseClient_1.default
            .from('health_records')
            .insert([recordData])
            .select()
            .single();
        if (error) {
            console.error("Supabase insert error:", error);
            throw error;
        }
        const returnRecord = {
            id: data.id.toString(),
            animalId: data.animalId.toString(),
            recordType: data.recordType,
            date: data.date,
            description: data.description,
            veterinarianName: data.veterinarianName,
            diagnosis: data.diagnosis,
            treatment: data.treatment,
            medications: data.medications,
            cost: data.cost,
            nextCheckupDate: data.nextCheckupDate,
            notes: data.notes,
            createdAt: data.createdAt
        };
        res.status(201).json(returnRecord);
    }
    catch (error) {
        console.error("Error adding health record:", error);
        res.status(500).json({ error: "Failed to add health record" });
    }
};
exports.addHealthRecord = addHealthRecord;
// Dashboard summary
const getAnimalSummary = async (req, res) => {
    try {
        const animals = await readAnimals();
        const weightRecords = await readWeightRecords();
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
const backupAnimals = async (req, res) => {
    try {
        const animals = await readAnimals();
        const weightRecords = await readWeightRecords();
        const breedingRecords = await readBreedingRecords();
        const vaccinationRecords = await readVaccinationRecords();
        const healthRecords = await readHealthRecords();
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