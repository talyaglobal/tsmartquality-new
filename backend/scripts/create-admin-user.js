import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Initialize Supabase client with SERVICE_ROLE key (has admin privileges)
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing environment variables SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createAdminUser() {
  try {
    // Create admin user
    const { data: userData, error: userError } = await supabase.auth.admin.createUser({
      email: 'info@tsmart.ai',
      password: 'secure-admin-password', // You should change this to a strong password
      email_confirm: true,  // Auto-confirm the email
      user_metadata: {
        full_name: 'TSmart Admin',
        is_admin: true
      }
    });

    if (userError) {
      throw userError;
    }

    console.log('Admin user created successfully:', userData.user.id);

    // Insert into users table
    const { data: profileData, error: profileError } = await supabase
      .from('users')
      .insert({
        id: userData.user.id,
        full_name: 'TSmart Admin',
        company_id: 1,
        is_active: true
      })
      .select();

    if (profileError) {
      throw profileError;
    }

    console.log('Admin user profile created successfully:', profileData);
    
    // Now you can run the sample data script
    console.log('You can now run the sample data script without foreign key errors.');
    
  } catch (error) {
    console.error('Error creating admin user:', error.message);
    
    // Check if error is because user already exists
    if (error.message.includes('already registered')) {
      console.log('User with email info@tsmart.ai already exists.');
      
      // Try to get the user ID
      const { data, error: getUserError } = await supabase.auth.admin.listUsers();
      
      if (!getUserError) {
        const adminUser = data.users.find(user => user.email === 'info@tsmart.ai');
        if (adminUser) {
          console.log('Existing admin user ID:', adminUser.id);
          console.log('You can use this ID in your sample data script.');
        }
      }
    }
  }
}

// Run the function
createAdminUser();