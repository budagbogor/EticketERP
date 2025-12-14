-- Force update budagbogor@gmail.com to Admin
DO $$ 
DECLARE 
    target_email TEXT := 'budagbogor@gmail.com';
    target_user_id UUID;
BEGIN
    SELECT id INTO target_user_id FROM public.profiles WHERE email = target_email;

    IF target_user_id IS NOT NULL THEN
        -- 1. Remove 'staff' role
        DELETE FROM public.user_roles WHERE user_id = target_user_id AND role = 'staff';
        
        -- 2. Add 'admin' role
        INSERT INTO public.user_roles (user_id, role)
        VALUES (target_user_id, 'admin')
        ON CONFLICT (user_id, role) DO NOTHING;
        
        RAISE NOTICE 'SUCCESS: User % is now an ADMIN.', target_email;
    ELSE
        RAISE NOTICE 'ERROR: User % NOT FOUND. Please register first.', target_email;
    END IF;
END $$;
