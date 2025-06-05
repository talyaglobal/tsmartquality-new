# TSmart Quality Backend

Backend API for the TSmart Quality Management System.

## Database Setup

### Setting Up the Admin User

Before running the database schema and sample data scripts, you need to create an admin user in Supabase Auth. This is required because the `users` table has a foreign key constraint that references the Supabase Auth users.

1. Copy `.env.example` to `.env` and fill in your Supabase credentials:
   ```bash
   cp .env.example .env
   ```

2. Update the `.env` file with your Supabase URL and service role key (available in the Supabase dashboard under Project Settings > API).

3. Run the admin user creation script:
   ```bash
   node scripts/create-admin-user.js
   ```

   This script will:
   - Create an admin user with email `info@tsmart.ai` in Supabase Auth
   - Insert a corresponding record in the `users` table
   - Output the UUID of the created user

### Database Schema and Sample Data

After creating the admin user, you can run the database schema and sample data scripts:

1. Run the database schema script:
   ```bash
   psql -h your-supabase-db-host -U postgres -d postgres -f ../database-schema.sql
   ```

2. Run the sample data script:
   ```bash
   psql -h your-supabase-db-host -U postgres -d postgres -f ../sample-data.sql
   ```

## Running the API

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. For production:
   ```bash
   npm run build
   npm start
   ```

## API Documentation

API documentation is available at `/api-docs` when the server is running.

## Environment Variables

See `.env.example` for all required environment variables.

## Troubleshooting

### Foreign Key Constraint Error

If you encounter a foreign key constraint error like:

```
ERROR: 23503: insert or update on table "users" violates foreign key constraint "users_id_fkey"
```

This means you need to create the admin user in Supabase Auth first. Follow the "Setting Up the Admin User" section above.

### Alternative Solution

If you're unable to create the admin user in Supabase Auth, you can modify the database schema to remove the foreign key constraint (not recommended for production):

```sql
ALTER TABLE users DROP CONSTRAINT users_id_fkey;
ALTER TABLE users ADD CONSTRAINT users_id_unique UNIQUE (id);
```

This will allow you to insert users without a corresponding auth user, but you'll need to handle the relationship at the application level.