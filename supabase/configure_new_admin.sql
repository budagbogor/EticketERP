-- 1. Update the trigger function to automatically make budagbogor@gmail.com an admin
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  assigned_role public.app_role;
BEGIN
  INSERT INTO public.profiles (id, name, email, branch)
  VALUES (
    new.id, 
    COALESCE(new.raw_user_meta_data ->> 'name', new.email), 
    new.email,
    new.raw_user_meta_data ->> 'branch'
  );
  
  -- Determine role based on email
  IF new.email = 'admin@mobeng.com' OR new.email = 'budagbogor@gmail.com' THEN
    assigned_role := 'admin';
  ELSE
    assigned_role := 'staff';
  END IF;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (new.id, assigned_role);
  
  RETURN new;
END;
$$;

-- 2. If the user ALREADY exists, manually promote them to admin
DO $$ 
DECLARE 
    target_email TEXT := 'budagbogor@gmail.com';
    target_user_id UUID;
BEGIN
    SELECT id INTO target_user_id FROM public.profiles WHERE email = target_email;

    IF target_user_id IS NOT NULL THEN
        -- Remove any existing roles
        DELETE FROM public.user_roles WHERE user_id = target_user_id;
        
        -- Assign admin role
        INSERT INTO public.user_roles (user_id, role)
        VALUES (target_user_id, 'admin')
        ON CONFLICT (user_id, role) DO NOTHING;
        
        RAISE NOTICE 'Upgraded existing user % to admin', target_email;
    ELSE
        RAISE NOTICE 'User % does not exist yet. They will be admin when they register.', target_email;
    END IF;
END $$;
