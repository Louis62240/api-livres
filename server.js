const express = require("express");
const app = express();
const PORT = 3000;

const bookRoutes = require("./routes/bookRoutes");

// Middleware
app.use(express.json());

// Routes
app.use("/books", bookRoutes);

// Middleware d’erreurs global
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Erreur interne du serveur" });
});

// Lancer serveur
app.listen(PORT, () => {
  console.log(`📚 API Livre dispo sur http://localhost:${PORT}`);
});
