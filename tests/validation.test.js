const request = require('supertest');
const express = require('express');
const bookRoutes = require('../routes/bookRoutes');
const BookModel = require('../models/bookModel');
const TestDatabase = require('./testDatabase');

const app = express();
app.use(express.json());
app.use('/books', bookRoutes);

describe('Books API - Validation Tests', () => {
  let testDb;

  beforeEach(async () => {
    testDb = new TestDatabase();
    await testDb.setupDatabase();
    BookModel.setDatabase(testDb.getDatabase());
  });

  afterEach(async () => {
    await testDb.close();
  });

  describe('Data Validation', () => {
    test('devrait rejeter un livre avec un titre vide', async () => {
      const invalidBook = {
        title: '',
        author: 'Auteur Test'
      };

      await request(app)
        .post('/books')
        .send(invalidBook)
        .expect(400);
    });

    test('devrait rejeter un livre avec un auteur vide', async () => {
      const invalidBook = {
        title: 'Titre Test',
        author: ''
      };

      await request(app)
        .post('/books')
        .send(invalidBook)
        .expect(400);
    });

    test('devrait accepter un livre avec une année nulle', async () => {
      const validBook = {
        title: 'Livre Sans Année',
        author: 'Auteur Test',
        year: null
      };

      const response = await request(app)
        .post('/books')
        .send(validBook)
        .expect(201);

      expect(response.body.year).toBeNull();
    });

    test('devrait accepter un livre avec des caractères spéciaux', async () => {
      const validBook = {
        title: 'L\'Étranger & les Âmes mortes',
        author: 'Jean-François Müller',
        year: 2023
      };

      const response = await request(app)
        .post('/books')
        .send(validBook)
        .expect(201);

      expect(response.body.title).toBe(validBook.title);
      expect(response.body.author).toBe(validBook.author);
    });

    test('devrait gérer les IDs non numériques', async () => {
      await request(app)
        .get('/books/abc')
        .expect(404);
    });

    test('devrait gérer les IDs négatifs', async () => {
      await request(app)
        .get('/books/-1')
        .expect(404);
    });
  });

  describe('Edge Cases', () => {
    test('devrait gérer un titre très long', async () => {
      const longTitle = 'A'.repeat(500); // 500 caractères
      const validBook = {
        title: longTitle,
        author: 'Auteur Test',
        year: 2023
      };

      const response = await request(app)
        .post('/books')
        .send(validBook)
        .expect(201);

      expect(response.body.title).toBe(longTitle);
    });

    test('devrait gérer une année dans le futur', async () => {
      const validBook = {
        title: 'Livre du Futur',
        author: 'Auteur Futuriste',
        year: 3000
      };

      const response = await request(app)
        .post('/books')
        .send(validBook)
        .expect(201);

      expect(response.body.year).toBe(3000);
    });

    test('devrait gérer une année très ancienne', async () => {
      const validBook = {
        title: 'Livre Ancien',
        author: 'Auteur Antique',
        year: -500
      };

      const response = await request(app)
        .post('/books')
        .send(validBook)
        .expect(201);

      expect(response.body.year).toBe(-500);
    });
  });

  describe('Content-Type Validation', () => {
    test('devrait gérer une requête avec données malformées', async () => {
      const response = await request(app)
        .post('/books')
        .send('title=Test&author=Test')
        .expect(500); // Express retourne 500 pour du JSON malformé
    });

    test('devrait accepter du JSON valide', async () => {
      const validBook = {
        title: 'JSON Test',
        author: 'Test Author'
      };

      await request(app)
        .post('/books')
        .set('Content-Type', 'application/json')
        .send(JSON.stringify(validBook))
        .expect(201);
    });
  });
});
