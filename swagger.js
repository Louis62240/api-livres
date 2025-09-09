const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

// Options Swagger
const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "API Livre",
      version: "1.0.0",
      description: "Une API REST pour gérer des livres",
    },
    servers: [
      {
        url: "http://localhost:3000",
      },
    ],
  },
  apis: ["./routes/*.js"], // Où Swagger va chercher les annotations
};

const specs = swaggerJsdoc(options);

module.exports = { swaggerUi, specs };
