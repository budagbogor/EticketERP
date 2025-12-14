-- Migration to synchronize auth.users with public.profiles and public.app_users
-- This ensures all users in Supabase Auth appear in the User Management list

DO $$
DECLARE
    r RECORD;
    v_role_text TEXT;
    v_name TEXT;
    v_branch TEXT;
    v_nik TEXT;
BEGIN
    FOR r IN SELECT * FROM auth.users LOOP
        -- 1. Extract metadata safely
        v_name := COALESCE(r.raw_user_meta_data->>'name', split_part(r.email, '@', 1));
        v_nik := r.raw_user_meta_data->>'nik';
        v_branch := r.raw_user_meta_data->>'branch';
        
        -- Default NIK to email if missing (since NIK is NOT NULL and UNIQUE in app_users)
        IF v_nik IS NULL OR v_nik = '' THEN
            v_nik := r.email;
        END IF;

        -- 2. Determine role from user_roles table, or default to staff
        SELECT role::text INTO v_role_text FROM public.user_roles WHERE user_id = r.id;
        
        IF v_role_text IS NULL THEN
             IF r.email = 'admin@mobeng.com' OR r.email = 'budagbogor@gmail.com' THEN
                v_role_text := 'admin';
             ELSE
                v_role_text := 'staff';
             END IF;
             
             -- Fix missing entry in user_roles
             INSERT INTO public.user_roles (user_id, role) 
             VALUES (r.id, v_role_text::public.app_role) 
             ON CONFLICT (user_id, role) DO NOTHING;
        END IF;

        -- 3. Sync into Profiles
        INSERT INTO public.profiles (id, name, email, nik, branch)
        VALUES (r.id, v_name, r.email, v_nik, v_branch)
        ON CONFLICT (id) DO UPDATE SET
            name = EXCLUDED.name,
            email = EXCLUDED.email,
            nik = EXCLUDED.nik,
            branch = EXCLUDED.branch;

        -- 4. Sync into App Users (Crucial for User Management page)
        -- Note: app_users uses 'user_role' enum, while user_roles uses 'app_role' enum. 
        -- We cast via text to handle this technical debt.
        BEGIN
            INSERT INTO public.app_users (id, nik, name, email, role, branch)
            VALUES (
                r.id, 
                v_nik, 
                v_name, 
                r.email, 
                v_role_text::public.user_role, 
                v_branch
            )
            ON CONFLICT (id) DO UPDATE SET
                nik = EXCLUDED.nik,
                name = EXCLUDED.name,
                email = EXCLUDED.email,
                role = EXCLUDED.role,
                branch = EXCLUDED.branch;
        EXCEPTION 
            WHEN unique_violation THEN
                -- If NIK collision occurs (e.g. duplicate default emails as NIK), log it and skip
                RAISE NOTICE 'Skipping app_users sync for % due to NIK collision', r.email;
        END;
            
    END LOOP;
    
    RAISE NOTICE 'User synchronization completed.';
END $$;
