# Aura Haven Backend API

Backend API server for the Aura Haven farm management system.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Copy environment variables:

```bash
cp .env.example .env
```

3. Configure environment variables in `.env`:
   - `PORT`: Server port (default: 3001)
   - `CORS_ORIGIN`: Frontend URL (default: http://localhost:8080)
   - Add other API keys as needed

## Development

```bash
npm run dev
```

The server will start on http://localhost:3001 with API endpoints at http://localhost:3001/api

## Production

```bash
npm run build
npm start
```

## API Endpoints

### Core

- `GET /api/ping` - Health check
- `GET /api/demo` - Demo endpoint

### Expenses

- `GET /api/expenses` - Get all expenses
- `POST /api/expenses` - Create expense
- `PUT /api/expenses/:id` - Update expense
- `DELETE /api/expenses/:id` - Delete expense
- `POST /api/expenses/import` - Import expenses
- `POST /api/expenses/bulk-delete` - Bulk delete expenses
- `GET /api/expenses/backup` - Download backup

### Animals

- `GET /api/animals` - Get all animals
- `POST /api/animals` - Create animal
- `PUT /api/animals/:id` - Update animal
- `DELETE /api/animals/:id` - Delete animal
- `GET /api/animals/summary` - Get animals summary
- `GET /api/animals/backup` - Download backup

### Tasks

- `GET /api/tasks` - Get all tasks
- `POST /api/tasks` - Create task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task
- `POST /api/tasks/bulk-delete` - Bulk delete tasks
- `GET /api/tasks/backup` - Download backup

### Animal Records

- `GET /api/weight-records` - Get weight records
- `POST /api/weight-records` - Create weight record
- `GET /api/breeding-records` - Get breeding records
- `POST /api/breeding-records` - Create breeding record
- `GET /api/vaccination-records` - Get vaccination records
- `POST /api/vaccination-records` - Create vaccination record
- `GET /api/health-records` - Get health records
- `POST /api/health-records` - Create health record

## Data Storage

The backend uses JSON files for data storage located in `src/data/`:

- `animals.json` - Animal records
- `expenses.json` - Expense records
- `TaskTracker.json` - Task records
- `categories.json` - Expense categories
- `weight-records.json` - Animal weight records
- `breeding-records.json` - Breeding records
- `vaccination-records.json` - Vaccination records
- `health-records.json` - Health records

## Testing

```bash
npm test
```

## Type Safety

The backend shares types with the frontend through the `../shared/` directory:

- `animal-types.ts` - Animal-related types
- `expense-types.ts` - Expense-related types
- `api.ts` - General API types
