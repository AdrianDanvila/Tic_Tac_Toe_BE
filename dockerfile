# Usa la imagen oficial de Node.js
FROM node:18

# Establece el directorio de trabajo en el contenedor
WORKDIR /app

# Copia los archivos del proyecto
COPY package.json package-lock.json ./
RUN npm install

# Copia el código fuente
COPY . .

# Expone el puerto 8080 para WebSockets
EXPOSE 8080

# Comando para iniciar el servidor
CMD ["node", "server.js"]
