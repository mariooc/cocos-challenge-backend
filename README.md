# Proyecto Node.js con Docker

Este proyecto es una aplicación Node.js que utiliza Docker para la base de datos y otros servicios necesarios.

## Requisitos

Asegúrate de tener instalados los siguientes programas antes de iniciar el proyecto:

- [Node.js](https://nodejs.org/)
- [Docker](https://www.docker.com/get-started)
- [Docker Compose](https://docs.docker.com/compose/install/)

## Instalación

Sigue estos pasos para configurar e iniciar el proyecto:

### 1. Clonar el repositorio

Clona el repositorio a tu máquina local.

```bash
git clone https://github.com/mariooc/cocos-challenge-backend
cd cocos-challenge-backend
```

### 2. Instalar dependencias

```bash
npm i
```

### 3. configurar el archivo .env

```bash
cp .env.example .env
```

### 4. Iniciar DB

Inicia la base de datos Docker.

```bash
docker-compose up -d
```

### 5. Iniciar el servidor

Inicia el servidor Node.js.

```bash
npm run dev
```

### 6. Acceder al servidor

```
http://localhost:3000
```
