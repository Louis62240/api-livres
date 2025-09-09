const BookModel = require('../models/bookModel');
const TestDatabase = require('./testDatabase');

describe('BookModel', () => {
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

  describe('create', () => {
    test('devrait créer un nouveau livre', (done) => {
      const bookData = {
        title: 'Test Book',
        author: 'Test Author',
        year: 2023
      };

      BookModel.create(bookData, (err, result) => {
        expect(err).toBeNull();
        expect(result).toBeDefined();
        expect(result.id).toBeDefined();
        expect(result.title).toBe(bookData.title);
        expect(result.author).toBe(bookData.author);
        expect(result.year).toBe(bookData.year);
        done();
      });
    });

    test('devrait créer un livre sans année', (done) => {
      const bookData = {
        title: 'Test Book Without Year',
        author: 'Test Author'
      };

      BookModel.create(bookData, (err, result) => {
        expect(err).toBeNull();
        expect(result).toBeDefined();
        expect(result.id).toBeDefined();
        expect(result.title).toBe(bookData.title);
        expect(result.author).toBe(bookData.author);
        expect(result.year).toBeUndefined();
        done();
      });
    });
  });

  describe('getAll', () => {
    test('devrait retourner une liste vide si aucun livre', (done) => {
      BookModel.getAll((err, books) => {
        expect(err).toBeNull();
        expect(Array.isArray(books)).toBe(true);
        expect(books.length).toBe(0);
        done();
      });
    });

    test('devrait retourner tous les livres', async () => {
      // Ajouter des données de test
      await testDb.insertTestData();

      return new Promise((resolve) => {
        BookModel.getAll((err, books) => {
          expect(err).toBeNull();
          expect(Array.isArray(books)).toBe(true);
          expect(books.length).toBe(2);
          expect(books[0].title).toBe('Test Book 1');
          expect(books[1].title).toBe('Test Book 2');
          resolve();
        });
      });
    });
  });

  describe('getById', () => {
    test('devrait retourner un livre par son ID', async () => {
      await testDb.insertTestData();

      return new Promise((resolve) => {
        BookModel.getById(1, (err, book) => {
          expect(err).toBeNull();
          expect(book).toBeDefined();
          expect(book.id).toBe(1);
          expect(book.title).toBe('Test Book 1');
          expect(book.author).toBe('Test Author 1');
          resolve();
        });
      });
    });

    test('devrait retourner undefined pour un ID inexistant', (done) => {
      BookModel.getById(999, (err, book) => {
        expect(err).toBeNull();
        expect(book).toBeUndefined();
        done();
      });
    });
  });

  describe('update', () => {
    test('devrait mettre à jour un livre existant', async () => {
      await testDb.insertTestData();

      const updatedData = {
        title: 'Updated Book Title',
        author: 'Updated Author',
        year: 2025
      };

      return new Promise((resolve) => {
        BookModel.update(1, updatedData, (err, result) => {
          expect(err).toBeNull();
          expect(result).toBeDefined();
          expect(result.id).toBe(1);
          expect(result.title).toBe(updatedData.title);
          expect(result.author).toBe(updatedData.author);
          expect(result.year).toBe(updatedData.year);
          resolve();
        });
      });
    });
  });

  describe('delete', () => {
    test('devrait supprimer un livre existant', async () => {
      await testDb.insertTestData();

      return new Promise((resolve) => {
        BookModel.delete(1, (err) => {
          expect(err).toBeNull();
          
          // Vérifier que le livre a été supprimé
          BookModel.getById(1, (err, book) => {
            expect(err).toBeNull();
            expect(book).toBeUndefined();
            resolve();
          });
        });
      });
    });

    test('devrait réussir même si le livre n\'existe pas', (done) => {
      BookModel.delete(999, (err) => {
        expect(err).toBeNull();
        done();
      });
    });
  });
});
