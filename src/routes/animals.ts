import { RequestHandler } from "express";
import {
  AnimalRecord,
  WeightRecord,
  BreedingRecord,
  VaccinationRecord,
  HealthRecord,
  AnimalSummary,
} from "@shared/animal-types";
import supabase from './supabaseClient';

// Helper functions for database operations
const readAnimals = async (): Promise<AnimalRecord[]> => {
  try {
    const { data: animals, error } = await supabase
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
  } catch (error) {
    console.error("Error reading animals:", error);
    return [];
  }
};

const readWeightRecords = async (animalId?: string): Promise<WeightRecord[]> => {
  try {
    let query = supabase
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
  } catch (error) {
    console.error("Error reading weight records:", error);
    return [];
  }
};

const readBreedingRecords = async (animalId?: string): Promise<BreedingRecord[]> => {
  try {
    let query = supabase
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
  } catch (error) {
    console.error("Error reading breeding records:", error);
    return [];
  }
};

const readVaccinationRecords = async (animalId?: string): Promise<VaccinationRecord[]> => {
  try {
    let query = supabase
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
  } catch (error) {
    console.error("Error reading vaccination records:", error);
    return [];
  }
};

const readHealthRecords = async (animalId?: string): Promise<HealthRecord[]> => {
  try {
    let query = supabase
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
  } catch (error) {
    console.error("Error reading health records:", error);
    return [];
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
