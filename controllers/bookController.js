const BookModel = require('../models/bookModel');

exports.getAllBooks = (req, res) => {
  BookModel.getAll((err, books) => {
    if (err) {
      console.error('Erreur lors de la récupération des livres:', err);
      return res.status(500).json({ message: "Erreur lors de la récupération des livres" });
    }
    res.json(books);
  });
};

exports.getBookById = (req, res) => {
  const id = parseInt(req.params.id);
  BookModel.getById(id, (err, book) => {
    if (err) {
      console.error('Erreur lors de la récupération du livre:', err);
      return res.status(500).json({ message: "Erreur lors de la récupération du livre" });
    }
    if (!book) {
      return res.status(404).json({ message: "Livre non trouvé" });
    }
    res.json(book);
  });
};

exports.createBook = (req, res) => {
  const { title, author, year } = req.body;
  
  // Validation
  if (!title || !author) {
    return res.status(400).json({ message: "Titre et auteur requis" });
  }

  const bookData = { title, author, year: year || null };
  
  BookModel.create(bookData, (err, newBook) => {
    if (err) {
      console.error('Erreur lors de la création du livre:', err);
      return res.status(500).json({ message: "Erreur lors de la création du livre" });
    }
    res.status(201).json(newBook);
  });
};

exports.updateBook = (req, res) => {
  const id = parseInt(req.params.id);
  const { title, author, year } = req.body;

  // Vérifier d'abord si le livre existe
  BookModel.getById(id, (err, existingBook) => {
    if (err) {
      console.error('Erreur lors de la vérification du livre:', err);
      return res.status(500).json({ message: "Erreur lors de la vérification du livre" });
    }
    
    if (!existingBook) {
      return res.status(404).json({ message: "Livre non trouvé" });
    }

    // Utiliser les valeurs existantes si pas de nouvelles valeurs
    const updatedBook = {
      title: title || existingBook.title,
      author: author || existingBook.author,
      year: year !== undefined ? year : existingBook.year
    };

    BookModel.update(id, updatedBook, (err, book) => {
      if (err) {
        console.error('Erreur lors de la mise à jour du livre:', err);
        return res.status(500).json({ message: "Erreur lors de la mise à jour du livre" });
      }
      res.json(book);
    });
  });
};

exports.deleteBook = (req, res) => {
  const id = parseInt(req.params.id);
  
  // Vérifier d'abord si le livre existe
  BookModel.getById(id, (err, book) => {
    if (err) {
      console.error('Erreur lors de la vérification du livre:', err);
      return res.status(500).json({ message: "Erreur lors de la vérification du livre" });
    }
    
    if (!book) {
      return res.status(404).json({ message: "Livre non trouvé" });
    }

    BookModel.delete(id, (err) => {
      if (err) {
        console.error('Erreur lors de la suppression du livre:', err);
        return res.status(500).json({ message: "Erreur lors de la suppression du livre" });
      }
      res.status(204).send();
    });
  });
};
