-- Execute this script in your Supabase SQL Editor to fix the admin role

DO $$ 
DECLARE 
    target_email TEXT := 'admin@mobeng.com';
    target_user_id UUID;
BEGIN
    -- Get the user ID from auth.users (requires permissions to view auth schema, or run as postgres/service_role)
    -- Since we can't easily query auth.users directly in some contexts without elevated privileges, 
    -- we might need to rely on the user ID if known, but let's try via profiles which is linked.
    
    SELECT id INTO target_user_id FROM public.profiles WHERE email = target_email;

    IF target_user_id IS NOT NULL THEN
        -- Remove existing staff role if present
        DELETE FROM public.user_roles WHERE user_id = target_user_id AND role = 'staff';
        
        -- Insert admin role if not present
        INSERT INTO public.user_roles (user_id, role)
        VALUES (target_user_id, 'admin')
        ON CONFLICT (user_id, role) DO NOTHING;
        
        RAISE NOTICE 'Updated user % to admin role', target_email;
    ELSE
        RAISE NOTICE 'User % not found in profiles table', target_email;
    END IF;
END $$;
