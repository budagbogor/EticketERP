-- Run this to check the status of the admin user
DO $$ 
DECLARE 
    v_count int;
    v_role record;
    v_profile record;
BEGIN
    SELECT count(*) INTO v_count FROM public.profiles WHERE email = 'admin@mobeng.com';
    
    IF v_count = 0 THEN
        RAISE NOTICE 'DEBUG: User admin@mobeng.com DOES NOT EXIST in profiles table. Have you signed up?';
    ELSE
        RAISE NOTICE 'DEBUG: User admin@mobeng.com FOUND in profiles table.';
        
        FOR v_role IN SELECT role FROM public.user_roles ur JOIN public.profiles p ON ur.user_id = p.id WHERE p.email = 'admin@mobeng.com' LOOP
            RAISE NOTICE 'DEBUG: Assigned Role: %', v_role.role;
        END LOOP;
        
        IF NOT FOUND THEN
             RAISE NOTICE 'DEBUG: No roles assigned to this user.';
        END IF;
    END IF;
END $$;
