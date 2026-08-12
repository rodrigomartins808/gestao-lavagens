import { createClient } from '@supabase/supabase-js';
import pg from 'pg';
import fs from 'fs';
import path from 'path';

const { Client } = pg;

// Read env vars
const envFile = fs.readFileSync('/Users/rodrigoteixeiramartins/Desktop/posto-gestao/.env.local', 'utf-8');
const envVars = {};
envFile.split('\n').forEach(line => {
    const [key, ...value] = line.split('=');
    if (key && value) {
        envVars[key.trim()] = value.join('=').trim();
    }
});

const supabase = createClient(envVars.VITE_SUPABASE_URL, envVars.VITE_SUPABASE_ANON_KEY);

async function setup() {
    console.log('1. Signing up users...');
    
    const { error: e1 } = await supabase.auth.signUp({
        email: 'admin@garagemm.com',
        password: '1823-GarageAdmin'
    });
    if (e1 && e1.message !== 'User already registered') console.error('Error admin signup:', e1);

    const { error: e2 } = await supabase.auth.signUp({
        email: 'equipa@garagemm.com',
        password: '0000-GarageEquipa'
    });
    if (e2 && e2.message !== 'User already registered') console.error('Error equipa signup:', e2);

    console.log('2. Confirming emails via DB...');
    
    // Use object config to force IPv4
    const client = new Client({ 
        host: 'db.ivclqoitoofvvvocwbey.supabase.co',
        user: 'postgres',
        password: envVars.SUPABASE_DB_PASSWORD,
        database: 'postgres',
        port: 5432,
        ssl: { rejectUnauthorized: false }
    });
    // Force IPv4 in Node DNS resolution for this host? Node pg might not support family directly in config,
    // but usually ssl: true helps, and passing the host directly without the URL string might use different resolution.
    // If it still fails, we might need a workaround for DB access.
    
    await client.connect();
    await client.query(`
        UPDATE auth.users 
        SET email_confirmed_at = NOW() 
        WHERE email IN ('admin@garagemm.com', 'equipa@garagemm.com');
    `);
    console.log('Done confirming users.');
    
    console.log('3. Assigning roles in raw_user_meta_data...');
    await client.query(`
        UPDATE auth.users 
        SET raw_user_meta_data = '{"role": "admin", "name": "Administrador"}'
        WHERE email = 'admin@garagemm.com';

        UPDATE auth.users 
        SET raw_user_meta_data = '{"role": "employee", "name": "Equipa (Geral)"}'
        WHERE email = 'equipa@garagemm.com';
    `);

    console.log('4. Configuring RLS...');
    await client.query(`
        -- Enable RLS
        ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
        ALTER TABLE public.washes ENABLE ROW LEVEL SECURITY;
        ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
        ALTER TABLE public.whatsapp_queue ENABLE ROW LEVEL SECURITY;
        ALTER TABLE public.bot_status ENABLE ROW LEVEL SECURITY;

        -- Drop ALL existing policies to ensure a clean slate
        DROP POLICY IF EXISTS "Staff full access customers" ON public.customers;
        DROP POLICY IF EXISTS "Staff full access washes" ON public.washes;
        DROP POLICY IF EXISTS "Staff full access vehicles" ON public.vehicles;
        DROP POLICY IF EXISTS "Staff full access whatsapp" ON public.whatsapp_queue;
        DROP POLICY IF EXISTS "Staff full access bot_status" ON public.bot_status;
        DROP POLICY IF EXISTS "Anon read customers" ON public.customers;
        DROP POLICY IF EXISTS "Anon read washes" ON public.washes;
        DROP POLICY IF EXISTS "Anon read vehicles" ON public.vehicles;

        -- Admin and Employees have full access to everything
        CREATE POLICY "Staff full access customers" ON public.customers FOR ALL USING (auth.role() = 'authenticated');
        CREATE POLICY "Staff full access washes" ON public.washes FOR ALL USING (auth.role() = 'authenticated');
        CREATE POLICY "Staff full access vehicles" ON public.vehicles FOR ALL USING (auth.role() = 'authenticated');
        CREATE POLICY "Staff full access whatsapp" ON public.whatsapp_queue FOR ALL USING (auth.role() = 'authenticated');
        CREATE POLICY "Staff full access bot_status" ON public.bot_status FOR ALL USING (auth.role() = 'authenticated');
        
        -- To allow customers to login via the front-end (which currently uses the anon key),
        -- we need to allow anonymous READ access to customers based on phone number and customer number.
        -- We will allow anonymous users to read ALL customers, but we can't do that safely!
        -- Wait, if customers read via Anon, hackers can read them too.
        -- We should secure the customer login via a serverless function, or use Supabase Auth for customers!
        -- But for now, we'll use a trick: Allow Anon to select if they already know the phone number and customer number.
        -- Unfortunately, Supabase RLS policies for SELECT can't easily restrict based on the WHERE clause of the query in a secure way against arbitrary queries.
        -- Actually, they can! By using a secure SECURITY DEFINER function to log in customers!
        -- For this phase, we will keep customers readable by anon to avoid breaking the app immediately,
        -- BUT we will restrict WRITE operations to authenticated staff.
        
        -- Since the hacker threat is massive data dumping, we should restrict SELECT on customers to authenticated staff.
        -- Wait, if we restrict SELECT to authenticated staff, how do customers log in?
        -- They use \`loginCustomer(numero, phone)\`. We can write a PostgreSQL function that performs the login and bypasses RLS!
    `);

    // Let's create the securely definer function for customer login
    await client.query(`
        CREATE OR REPLACE FUNCTION public.login_customer(p_numero text, p_telemovel text)
        RETURNS SETOF public.customers
        LANGUAGE plpgsql
        SECURITY DEFINER -- This bypasses RLS
        AS $$
        BEGIN
            RETURN QUERY SELECT * FROM public.customers WHERE numero_cliente = p_numero AND telemovel = p_telemovel LIMIT 1;
        END;
        $$;

        CREATE OR REPLACE FUNCTION public.get_customer_washes(p_cliente_id text)
        RETURNS SETOF public.washes
        LANGUAGE plpgsql
        SECURITY DEFINER
        AS $$
        BEGIN
            RETURN QUERY SELECT * FROM public.washes WHERE cliente_id = p_cliente_id::uuid ORDER BY data DESC;
        END;
        $$;
        
        CREATE OR REPLACE FUNCTION public.get_customer_vehicles(p_cliente_id text)
        RETURNS SETOF public.vehicles
        LANGUAGE plpgsql
        SECURITY DEFINER
        AS $$
        BEGIN
            RETURN QUERY SELECT * FROM public.vehicles WHERE cliente_id = p_cliente_id::uuid;
        END;
        $$;
    `);

    await client.end();
}

setup().catch(console.error);
