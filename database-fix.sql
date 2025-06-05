-- Fix for the foreign key constraint issue

-- Step 1: Create the admin user in Supabase Auth first (must be done via API or dashboard)
-- This cannot be done directly in SQL as Supabase handles auth operations

-- Step 2: Modify the sample data script to check for the admin user and handle the constraint correctly
DO $$
DECLARE 
  admin_id UUID;
  admin_exists BOOLEAN;
BEGIN
  -- Get the admin user ID if it exists
  SELECT EXISTS (SELECT 1 FROM auth.users WHERE email = 'info@tsmart.ai') INTO admin_exists;
  
  IF admin_exists THEN
    -- Get the admin user's UUID
    SELECT id INTO admin_id FROM auth.users WHERE email = 'info@tsmart.ai' LIMIT 1;
    
    -- Insert into users table only if the auth user exists
    INSERT INTO users (id, full_name, company_id, is_active)
    VALUES (admin_id, 'TSmart Admin', 1, TRUE)
    ON CONFLICT (id) DO NOTHING;
    
    RAISE NOTICE 'Admin user found and added to users table with ID: %', admin_id;
  ELSE
    RAISE EXCEPTION 'Admin user with email info@tsmart.ai not found in auth.users table. 
    Please create this user in Supabase Auth first using the admin dashboard or auth API.';
  END IF;
END $$;

-- Alternative approach: Create the admin user with the API before running this script
-- Using JavaScript with Supabase client:
/*
const { data, error } = await supabase.auth.admin.createUser({
  email: 'info@tsmart.ai',
  password: 'secure-password',
  email_confirm: true
})
*/

-- Or you can modify your database schema to remove the foreign key constraint
-- and handle the relationship at the application level (NOT RECOMMENDED):
/*
ALTER TABLE users DROP CONSTRAINT users_id_fkey;
ALTER TABLE users ADD CONSTRAINT users_id_unique UNIQUE (id);
*/