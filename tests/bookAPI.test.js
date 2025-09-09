const request = require('supertest');
const express = require('express');
const BookModel = require('../models/bookModel');
const bookRoutes = require('../routes/bookRoutes');
const TestDatabase = require('./testDatabase');

// Configuration de l'app de test
const app = express();
app.use(express.json());
app.use('/books', bookRoutes);

// Middleware d'erreurs
app.use((err, req, res, next) => {
  res.status(500).json({ message: "Erreur interne du serveur" });
});

describe('Books API', () => {
  let testDb;

  beforeEach(async () => {
    // Créer une nouvelle base de données de test avant chaque test
    testDb = new TestDatabase();
    await testDb.setupDatabase();
    BookModel.setDatabase(testDb.getDatabase());
  });

  afterEach(async () => {
    // Nettoyer après chaque test
    await testDb.close();
  });

  describe('GET /books', () => {
    test('devrait retourner une liste vide si aucun livre', async () => {
      const response = await request(app)
        .get('/books')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(0);
    });

    test('devrait retourner tous les livres', async () => {
      await testDb.insertTestData();

      const response = await request(app)
        .get('/books')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(2);
      expect(response.body[0].title).toBe('Test Book 1');
      expect(response.body[1].title).toBe('Test Book 2');
    });
  });

  describe('GET /books/:id', () => {
    test('devrait retourner un livre par son ID', async () => {
      await testDb.insertTestData();

      const response = await request(app)
        .get('/books/1')
        .expect(200);

      expect(response.body.id).toBe(1);
      expect(response.body.title).toBe('Test Book 1');
      expect(response.body.author).toBe('Test Author 1');
    });

    test('devrait retourner 404 pour un livre inexistant', async () => {
      const response = await request(app)
        .get('/books/999')
        .expect(404);

      expect(response.body.message).toBe('Livre non trouvé');
    });
  });

  describe('POST /books', () => {
    test('devrait créer un nouveau livre', async () => {
      const newBook = {
        title: 'Nouveau Livre',
        author: 'Nouvel Auteur',
        year: 2023
      };

      const response = await request(app)
        .post('/books')
        .send(newBook)
        .expect(201);

      expect(response.body.id).toBeDefined();
      expect(response.body.title).toBe(newBook.title);
      expect(response.body.author).toBe(newBook.author);
      expect(response.body.year).toBe(newBook.year);
    });

    test('devrait retourner 400 si le titre manque', async () => {
      const invalidBook = {
        author: 'Auteur Sans Titre'
      };

      const response = await request(app)
        .post('/books')
        .send(invalidBook)
        .expect(400);

      expect(response.body.message).toBe('Titre et auteur requis');
    });

    test('devrait retourner 400 si l\'auteur manque', async () => {
      const invalidBook = {
        title: 'Titre Sans Auteur'
      };

      const response = await request(app)
        .post('/books')
        .send(invalidBook)
        .expect(400);

      expect(response.body.message).toBe('Titre et auteur requis');
    });

    test('devrait créer un livre sans année', async () => {
      const newBook = {
        title: 'Livre Sans Année',
        author: 'Auteur'
      };

      const response = await request(app)
        .post('/books')
        .send(newBook)
        .expect(201);

      expect(response.body.id).toBeDefined();
      expect(response.body.title).toBe(newBook.title);
      expect(response.body.author).toBe(newBook.author);
      expect(response.body.year).toBeNull();
    });
  });

  describe('PUT /books/:id', () => {
    test('devrait mettre à jour un livre existant', async () => {
      await testDb.insertTestData();

      const updatedBook = {
        title: 'Titre Mis à Jour',
        author: 'Auteur Mis à Jour',
        year: 2025
      };

      const response = await request(app)
        .put('/books/1')
        .send(updatedBook)
        .expect(200);

      expect(response.body.id).toBe(1);
      expect(response.body.title).toBe(updatedBook.title);
      expect(response.body.author).toBe(updatedBook.author);
      expect(response.body.year).toBe(updatedBook.year);
    });

    test('devrait faire une mise à jour partielle', async () => {
      await testDb.insertTestData();

      const partialUpdate = {
        title: 'Nouveau Titre Seulement'
      };

      const response = await request(app)
        .put('/books/1')
        .send(partialUpdate)
        .expect(200);

      expect(response.body.id).toBe(1);
      expect(response.body.title).toBe(partialUpdate.title);
      expect(response.body.author).toBe('Test Author 1'); // Inchangé
      expect(response.body.year).toBe(2023); // Inchangé
    });

    test('devrait retourner 404 pour un livre inexistant', async () => {
      const updatedBook = {
        title: 'Titre',
        author: 'Auteur'
      };

      const response = await request(app)
        .put('/books/999')
        .send(updatedBook)
        .expect(404);

      expect(response.body.message).toBe('Livre non trouvé');
    });
  });

  describe('DELETE /books/:id', () => {
    test('devrait supprimer un livre existant', async () => {
      await testDb.insertTestData();

      await request(app)
        .delete('/books/1')
        .expect(204);

      // Vérifier que le livre a été supprimé
      await request(app)
        .get('/books/1')
        .expect(404);
    });

    test('devrait retourner 404 pour un livre inexistant', async () => {
      const response = await request(app)
        .delete('/books/999')
        .expect(404);

      expect(response.body.message).toBe('Livre non trouvé');
    });
  });
});
