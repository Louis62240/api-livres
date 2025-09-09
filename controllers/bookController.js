// Données en mémoire (à remplacer plus tard par une BDD)
let books = [
  { id: 1, title: "Le Petit Prince", author: "Antoine de Saint-Exupéry", year: 1943 },
  { id: 2, title: "L'Étranger", author: "Albert Camus", year: 1942 },
];

exports.getAllBooks = (req, res) => {
  res.json(books);
};

exports.getBookById = (req, res) => {
  const book = books.find(b => b.id === parseInt(req.params.id));
  if (!book) return res.status(404).json({ message: "Livre non trouvé" });
  res.json(book);
};

exports.createBook = (req, res) => {
  const { title, author, year } = req.body;
  if (!title || !author) {
    return res.status(400).json({ message: "Titre et auteur requis" });
  }
  const newBook = { id: books.length + 1, title, author, year };
  books.push(newBook);
  res.status(201).json(newBook);
};

exports.updateBook = (req, res) => {
  const book = books.find(b => b.id === parseInt(req.params.id));
  if (!book) return res.status(404).json({ message: "Livre non trouvé" });

  const { title, author, year } = req.body;
  book.title = title || book.title;
  book.author = author || book.author;
  book.year = year || book.year;

  res.json(book);
};

exports.deleteBook = (req, res) => {
  const index = books.findIndex(b => b.id === parseInt(req.params.id));
  if (index === -1) return res.status(404).json({ message: "Livre non trouvé" });

  books.splice(index, 1);
  res.status(204).send();
};
