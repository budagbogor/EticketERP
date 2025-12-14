-- Force update admin roles for key users
DO $$
DECLARE
  v_user_id uuid;
  target_email text;
BEGIN
  FOREACH target_email IN ARRAY ARRAY['admin@mobeng.com', 'budagbogor@gmail.com'] LOOP
    -- Find user in auth.users
    SELECT id INTO v_user_id FROM auth.users WHERE email = target_email;
    
    IF v_user_id IS NOT NULL THEN
      -- 1. Ensure user_roles has 'admin'
      -- First, remove any non-admin roles to avoid unique constraint issues if restricted
      DELETE FROM public.user_roles WHERE user_id = v_user_id AND role != 'admin';
      
      -- Insert admin role
      INSERT INTO public.user_roles (user_id, role)
      VALUES (v_user_id, 'admin')
      ON CONFLICT (user_id, role) DO NOTHING;
      
      -- 2. Update existing public.app_users table if exists
      UPDATE public.app_users 
      SET role = 'admin' 
      WHERE id = v_user_id;

      RAISE NOTICE 'Promoted % to admin', target_email;
    END IF;
  END LOOP;
END $$;

-- Update the handle_new_user function to ensure these users always get admin on signup/signin
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
  )
  ON CONFLICT (id) DO NOTHING;
  
  -- Determine role based on email or existing metadata
  IF new.email = 'admin@mobeng.com' OR new.email = 'budagbogor@gmail.com' THEN
    assigned_role := 'admin';
  ELSE
    assigned_role := 'staff';
  END IF;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (new.id, assigned_role)
  ON CONFLICT (user_id, role) DO NOTHING;
  
  RETURN new;
END;
$$;
