const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Créer ou ouvrir la base de données
const dbPath = path.join(__dirname, '../database.sqlite');
let db = new sqlite3.Database(dbPath);

// Créer la table books si elle n'existe pas
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS books (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    author TEXT NOT NULL,
    year INTEGER
  )`);

  // Insérer des données de test si la table est vide
  db.get("SELECT COUNT(*) as count FROM books", (err, row) => {
    if (err) {
      console.error('Erreur lors de la vérification des données:', err);
      return;
    }
    
    if (row.count === 0) {
      const stmt = db.prepare("INSERT INTO books (title, author, year) VALUES (?, ?, ?)");
      stmt.run("Le Petit Prince", "Antoine de Saint-Exupéry", 1943);
      stmt.run("L'Étranger", "Albert Camus", 1942);
      stmt.finalize();
      console.log('Données de test ajoutées à la base de données');
    }
  });
});

class BookModel {
  // Permettre l'injection d'une base de données (utile pour les tests)
  static setDatabase(database) {
    db = database;
  }

  // Obtenir tous les livres
  static getAll(callback) {
    db.all("SELECT * FROM books", callback);
  }

  // Obtenir un livre par ID
  static getById(id, callback) {
    db.get("SELECT * FROM books WHERE id = ?", [id], callback);
  }

  // Créer un nouveau livre
  static create(book, callback) {
    const { title, author, year } = book;
    db.run("INSERT INTO books (title, author, year) VALUES (?, ?, ?)", 
           [title, author, year], 
           function(err) {
             if (err) return callback(err);
             callback(null, { id: this.lastID, title, author, year });
           });
  }

  // Mettre à jour un livre
  static update(id, book, callback) {
    const { title, author, year } = book;
    db.run("UPDATE books SET title = ?, author = ?, year = ? WHERE id = ?",
           [title, author, year, id],
           function(err) {
             if (err) return callback(err);
             callback(null, { id: parseInt(id), title, author, year });
           });
  }

  // Supprimer un livre
  static delete(id, callback) {
    db.run("DELETE FROM books WHERE id = ?", [id], callback);
  }
}

module.exports = BookModel;