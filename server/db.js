import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { UserModel } from './models/User.js';
import { UserDataModel } from './models/UserData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'database.json');

// Ensure data directory exists for local fallback
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initial Database Structure for JSON fallback
const initialDb = {
  users: [],
  userData: {},
  meta: {
    version: '1.0.0',
    createdAt: new Date().toISOString(),
    lastUpdated: new Date().toISOString()
  }
};

class Database {
  constructor() {
    this.isMongoConnected = false;
    this.initLocal();
  }

  // Check if MongoDB is currently available
  isCloudDb() {
    return this.isMongoConnected && mongoose.connection.readyState === 1;
  }

  initLocal() {
    if (!fs.existsSync(DB_FILE)) {
      this.writeDb(initialDb);
      this.seedDemoUser();
    }
  }

  readDb() {
    try {
      if (!fs.existsSync(DB_FILE)) {
        return initialDb;
      }
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      return JSON.parse(raw);
    } catch (err) {
      console.error('Error reading database file, using fallback structure:', err);
      return initialDb;
    }
  }

  writeDb(data) {
    try {
      data.meta.lastUpdated = new Date().toISOString();
      const tempFile = `${DB_FILE}.tmp`;
      fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), 'utf-8');
      fs.renameSync(tempFile, DB_FILE);
    } catch (err) {
      console.error('Error writing database file:', err);
    }
  }

  seedDemoUser() {
    const db = this.readDb();
    const demoEmail = 'akundemo@rezekiq.id';
    const exists = db.users.some(u => u.email === demoEmail);
    if (!exists) {
      const salt = bcrypt.genSaltSync(10);
      const hashedPassword = bcrypt.hashSync('password123', salt);
      const demoId = 'demo-user-123';

      const demoUser = {
        id: demoId,
        email: demoEmail,
        password: hashedPassword,
        name: 'Akun Demo',
        gender: 'Laki-laki',
        phoneNumber: '08123456789',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      db.users.push(demoUser);

      const today = new Date().toISOString().slice(0, 10);
      db.userData[demoId] = {
        amalLog: {
          [today]: {
            'syukur-1': true,
            'syukur-2': true,
            'usaha-1': true
          }
        },
        journal: [
          { id: 'j1', date: today, content: 'Alhamdulillah hari ini mendapatkan kabar baik.' }
        ],
        customAmalan: [],
        theme: 'light',
        user: {
          id: demoId,
          name: 'Akun Demo',
          email: demoEmail,
          niat: 'Mencari ridha Allah dan keberkahan dalam rezeki.',
          phoneNumber: '08123456789',
          gender: 'Laki-laki',
          spiritualGoal: 'Istiqomah membaca Al-Waqiah dan dhuha setiap pagi',
          preferredRecitation: 'Surah Al-Waqiah',
          avatar: '',
          language: 'id',
          earnedRewards: ['syukur_completion', 'first_journal'],
          notificationSettings: {
            enabled: false,
            time: '17:00'
          },
          challenges: [],
          soundEffectsEnabled: true,
          selectedAmalanIds: []
        },
        updatedAt: new Date().toISOString()
      };

      this.writeDb(db);
    }
  }

  // Users
  async getUserByEmail(email) {
    const normalizedEmail = (email || '').toLowerCase().trim();
    if (this.isCloudDb()) {
      const doc = await UserModel.findOne({ email: normalizedEmail }).lean();
      return doc || null;
    }
    const db = this.readDb();
    return db.users.find(u => u.email.toLowerCase() === normalizedEmail) || null;
  }

  async getUserById(id) {
    if (this.isCloudDb()) {
      const doc = await UserModel.findOne({ id }).lean();
      return doc || null;
    }
    const db = this.readDb();
    return db.users.find(u => u.id === id) || null;
  }

  async createUser({ email, password, name, gender, phoneNumber }) {
    const existing = await this.getUserByEmail(email);
    if (existing) {
      throw new Error('Email sudah terdaftar di sistem cloud');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = {
      id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      name: name.trim(),
      gender: gender || 'Laki-laki',
      phoneNumber: phoneNumber || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const initialUserData = {
      userId: newUser.id,
      amalLog: {},
      journal: [],
      customAmalan: [],
      theme: 'light',
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        niat: 'Mencari ridha Allah dan keberkahan dalam rezeki.',
        phoneNumber: newUser.phoneNumber,
        gender: newUser.gender,
        spiritualGoal: '',
        preferredRecitation: '',
        avatar: '',
        language: 'id',
        earnedRewards: [],
        notificationSettings: {
          enabled: false,
          time: '17:00'
        },
        challenges: [],
        soundEffectsEnabled: true,
        selectedAmalanIds: []
      },
      updatedAt: new Date().toISOString()
    };

    if (this.isCloudDb()) {
      await UserModel.create(newUser);
      await UserDataModel.create(initialUserData);
    } else {
      const db = this.readDb();
      db.users.push(newUser);
      db.userData[newUser.id] = initialUserData;
      this.writeDb(db);
    }

    const { password: _, ...safeUser } = newUser;
    return { user: safeUser, data: initialUserData };
  }

  async verifyPassword(plainPassword, hashedPassword) {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  // User Data Sync
  async getUserData(userId) {
    if (this.isCloudDb()) {
      const doc = await UserDataModel.findOne({ userId }).lean();
      return doc || null;
    }
    const db = this.readDb();
    return db.userData[userId] || null;
  }

  async setUserData(userId, payload) {
    if (this.isCloudDb()) {
      const updated = await UserDataModel.findOneAndUpdate(
        { userId },
        {
          $set: {
            ...payload,
            updatedAt: new Date().toISOString()
          }
        },
        { new: true, upsert: true }
      ).lean();
      return updated;
    }

    const db = this.readDb();
    const existing = db.userData[userId] || {};

    db.userData[userId] = {
      ...existing,
      ...payload,
      updatedAt: new Date().toISOString()
    };

    this.writeDb(db);
    return db.userData[userId];
  }
}

export const db = new Database();
