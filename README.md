# Backend Setup - Todo List App

This is the **Backend** for the Todo List App built with **Express.js**, **Prisma**, and **MySQL**.

## Prerequisites

- Node.js (v16 or higher)
- MySQL or MariaDB
- Yarn or npm

## Installation

```bash
npm install
# or
yarn install
```

# Setup database on env
```bash
DATABASE_URL="mysql://USER:PASSWORD@localhost:3306/TODO_DB"
```

# Database migrate
```bash
npm run migrate:dev
```

# Generate Prisma Client (in case of schema changes):
```bash
npx prisma generate
```
# Run Project 
```bash
npm run dev
# or
npm start
```