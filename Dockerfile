# Stage 1: Build de Vue.js applicatie
FROM node:18-alpine AS build-stage

# Werkdirectory instellen
WORKDIR /app

# Kopieer package.json en package-lock.json (of yarn.lock)
COPY package*.json ./

# Installeer project dependencies
# Gebruik npm ci voor consistente builds als je een package-lock.json hebt
RUN npm ci

# Kopieer de rest van de applicatiecode
COPY . .

# Bouw de applicatie voor productie
RUN npm run build

# Stage 2: Serve de applicatie met Nginx
FROM nginx:stable-alpine AS serve-stage

# Kopieer de gebouwde statische bestanden van de build-stage
COPY --from=build-stage /app/dist /usr/share/nginx/html

# Kopieer de Nginx configuratie
# We maken dit bestand hierna aan
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose poort 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"] 