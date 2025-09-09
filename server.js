const express = require("express");
const app = express();
const PORT = 3000;

const bookRoutes = require("./routes/bookRoutes");
const { swaggerUi, specs } = require("./swagger");

app.use(express.json());

// Routes API
app.use("/books", bookRoutes);

// Swagger UI
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));

// Middleware d’erreurs
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Erreur interne du serveur" });
});

// Lancer serveur
app.listen(PORT, () => {
  console.log(`📚 API Livre dispo sur http://localhost:${PORT}`);
  console.log(`📖 Doc Swagger dispo sur http://localhost:${PORT}/api-docs`);
});
