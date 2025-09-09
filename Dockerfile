# Utiliser l'image Node.js LTS officielle
FROM node:18-alpine

# Informations sur l'image
LABEL maintainer="API Livres Team"
LABEL description="API REST pour la gestion de livres avec SQLite"
LABEL version="1.0.0"

# Créer un utilisateur non-root pour la sécurité
RUN addgroup -g 1001 -S nodejs && \
    adduser -S apiuser -u 1001 -G nodejs

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer les dépendances de production uniquement
RUN npm ci --only=production && npm cache clean --force

# Copier le code source
COPY --chown=apiuser:nodejs . .

# Créer le répertoire pour la base de données
RUN mkdir -p /app/data && chown apiuser:nodejs /app/data

# Exposer le port de l'application
EXPOSE 3000

# Passer à l'utilisateur non-root
USER apiuser

# Variables d'environnement par défaut
ENV NODE_ENV=production
ENV PORT=3000
ENV DB_PATH=/app/data/database.sqlite

# Commande de santé pour Docker
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/books || exit 1

# Commande par défaut
CMD ["node", "server.js"]
