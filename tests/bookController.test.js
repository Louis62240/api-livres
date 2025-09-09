const bookController = require('../controllers/bookController');
const BookModel = require('../models/bookModel');
const TestDatabase = require('./testDatabase');

describe('BookController', () => {
  let testDb;
  let req, res;

  beforeEach(async () => {
    // Configuration de la base de données de test
    testDb = new TestDatabase();
    await testDb.setupDatabase();
    BookModel.setDatabase(testDb.getDatabase());

    // Mock des objets req et res
    req = {
      params: {},
      body: {}
    };

    res = {
      json: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis()
    };
  });

  afterEach(async () => {
    await testDb.close();
    jest.clearAllMocks();
  });

  describe('getAllBooks', () => {
    test('devrait retourner tous les livres', async () => {
      await testDb.insertTestData();

      await new Promise((resolve) => {
        bookController.getAllBooks(req, res);
        setTimeout(() => {
          expect(res.json).toHaveBeenCalledWith(
            expect.arrayContaining([
              expect.objectContaining({ title: 'Test Book 1' }),
              expect.objectContaining({ title: 'Test Book 2' })
            ])
          );
          resolve();
        }, 100);
      });
    });

    test('devrait gérer les erreurs de base de données', async () => {
      // Fermer la base pour simuler une erreur
      await testDb.close();

      await new Promise((resolve) => {
        bookController.getAllBooks(req, res);
        setTimeout(() => {
          expect(res.status).toHaveBeenCalledWith(500);
          expect(res.json).toHaveBeenCalledWith({
            message: "Erreur lors de la récupération des livres"
          });
          resolve();
        }, 100);
      });
    });
  });

  describe('getBookById', () => {
    test('devrait retourner un livre par son ID', async () => {
      await testDb.insertTestData();
      req.params.id = '1';

      await new Promise((resolve) => {
        bookController.getBookById(req, res);
        setTimeout(() => {
          expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({
              id: 1,
              title: 'Test Book 1'
            })
          );
          resolve();
        }, 100);
      });
    });

    test('devrait retourner 404 si le livre n\'existe pas', async () => {
      req.params.id = '999';

      await new Promise((resolve) => {
        bookController.getBookById(req, res);
        setTimeout(() => {
          expect(res.status).toHaveBeenCalledWith(404);
          expect(res.json).toHaveBeenCalledWith({
            message: "Livre non trouvé"
          });
          resolve();
        }, 100);
      });
    });
  });

  describe('createBook', () => {
    test('devrait créer un nouveau livre', async () => {
      req.body = {
        title: 'Nouveau Livre',
        author: 'Nouvel Auteur',
        year: 2023
      };

      await new Promise((resolve) => {
        bookController.createBook(req, res);
        setTimeout(() => {
          expect(res.status).toHaveBeenCalledWith(201);
          expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({
              title: 'Nouveau Livre',
              author: 'Nouvel Auteur',
              year: 2023
            })
          );
          resolve();
        }, 100);
      });
    });

    test('devrait retourner 400 si les données sont invalides', async () => {
      req.body = {
        title: 'Titre Sans Auteur'
      };

      bookController.createBook(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Titre et auteur requis"
      });
    });
  });

  describe('updateBook', () => {
    test('devrait mettre à jour un livre existant', async () => {
      await testDb.insertTestData();
      req.params.id = '1';
      req.body = {
        title: 'Titre Mis à Jour'
      };

      await new Promise((resolve) => {
        bookController.updateBook(req, res);
        setTimeout(() => {
          expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({
              id: 1,
              title: 'Titre Mis à Jour',
              author: 'Test Author 1' // Inchangé
            })
          );
          resolve();
        }, 200);
      });
    });

    test('devrait retourner 404 si le livre n\'existe pas', async () => {
      req.params.id = '999';
      req.body = { title: 'Nouveau Titre' };

      await new Promise((resolve) => {
        bookController.updateBook(req, res);
        setTimeout(() => {
          expect(res.status).toHaveBeenCalledWith(404);
          expect(res.json).toHaveBeenCalledWith({
            message: "Livre non trouvé"
          });
          resolve();
        }, 100);
      });
    });
  });

  describe('deleteBook', () => {
    test('devrait supprimer un livre existant', async () => {
      await testDb.insertTestData();
      req.params.id = '1';

      await new Promise((resolve) => {
        bookController.deleteBook(req, res);
        setTimeout(() => {
          expect(res.status).toHaveBeenCalledWith(204);
          expect(res.send).toHaveBeenCalled();
          resolve();
        }, 200);
      });
    });

    test('devrait retourner 404 si le livre n\'existe pas', async () => {
      req.params.id = '999';

      await new Promise((resolve) => {
        bookController.deleteBook(req, res);
        setTimeout(() => {
          expect(res.status).toHaveBeenCalledWith(404);
          expect(res.json).toHaveBeenCalledWith({
            message: "Livre non trouvé"
          });
          resolve();
        }, 100);
      });
    });
  });
});
