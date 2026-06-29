# IDX-Exchange-FullStackProject


## Current Progress

### Week 1: Docker installation and contanier creation

- Imported RETS SQL data into the `rets` MySQL database
- Verified that the database tables exist and contain data

### Week 2: Backend and Database Setup

Completed so far: 
- Created a Node.js backend inside the `backend/` folder
- Installed Express, mysql2, dotenv, cors, and nodemon
- Connected the backend to a MySQL database using a connection pool
- Added a `/api/health` endpoint to verify database connectivity
- Configured nodemon so the server auto-restarts during development

## Technologies Used

- Node.js
- Express.js
- MySQL
- Docker
- mysql2
- dotenv
- cors
- nodemon

## Project Structure 

```text
backend/
  config/
    db.js
  .gitignore
  package-lock.json
  package.json
  server.js
```