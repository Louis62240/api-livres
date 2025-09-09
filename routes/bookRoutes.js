const express = require("express");
const router = express.Router();
const bookController = require("../controllers/bookController");

/**
 * @swagger
 * components:
 *   schemas:
 *     Book:
 *       type: object
 *       required:
 *         - title
 *         - author
 *       properties:
 *         id:
 *           type: integer
 *           description: ID du livre
 *         title:
 *           type: string
 *           description: Titre du livre
 *         author:
 *           type: string
 *           description: Auteur du livre
 *         year:
 *           type: integer
 *           description: Année de publication
 */

/**
 * @swagger
 * /books:
 *   get:
 *     summary: Récupérer tous les livres
 *     tags: [Books]
 *     responses:
 *       200:
 *         description: Liste de livres
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Book'
 */
router.get("/", bookController.getAllBooks);

/**
 * @swagger
 * /books/{id}:
 *   get:
 *     summary: Récupérer un livre par ID
 *     tags: [Books]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID du livre
 *     responses:
 *       200:
 *         description: Livre trouvé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Book'
 *       404:
 *         description: Livre non trouvé
 */
router.get("/:id", bookController.getBookById);

/**
 * @swagger
 * /books:
 *   post:
 *     summary: Ajouter un nouveau livre
 *     tags: [Books]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Book'
 *     responses:
 *       201:
 *         description: Livre créé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Book'
 */
router.post("/", bookController.createBook);

/**
 * @swagger
 * /books/{id}:
 *   put:
 *     summary: Mettre à jour un livre
 *     tags: [Books]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID du livre
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Book'
 *     responses:
 *       200:
 *         description: Livre mis à jour
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Book'
 */
router.put("/:id", bookController.updateBook);

/**
 * @swagger
 * /books/{id}:
 *   delete:
 *     summary: Supprimer un livre
 *     tags: [Books]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID du livre
 *     responses:
 *       204:
 *         description: Livre supprimé
 */
router.delete("/:id", bookController.deleteBook);

module.exports = router;
