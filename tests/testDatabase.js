const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Base de données de test en mémoire
class TestDatabase {
  constructor() {
    this.db = new sqlite3.Database(':memory:');
    this.setupDatabase();
  }

  setupDatabase() {
    return new Promise((resolve, reject) => {
      this.db.serialize(() => {
        // Créer la table books
        this.db.run(`CREATE TABLE IF NOT EXISTS books (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT NOT NULL,
          author TEXT NOT NULL,
          year INTEGER
        )`, (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    });
  }

  // Insérer des données de test
  insertTestData() {
    return new Promise((resolve, reject) => {
      const stmt = this.db.prepare("INSERT INTO books (title, author, year) VALUES (?, ?, ?)");
      stmt.run("Test Book 1", "Test Author 1", 2023);
      stmt.run("Test Book 2", "Test Author 2", 2024);
      stmt.finalize((err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  // Nettoyer la base de données
  clean() {
    return new Promise((resolve, reject) => {
      this.db.run("DELETE FROM books", (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  // Fermer la connexion
  close() {
    return new Promise((resolve) => {
      this.db.close((err) => {
        if (err) console.error(err);
        resolve();
      });
    });
  }

  getDatabase() {
    return this.db;
  }
}

module.exports = TestDatabase;
