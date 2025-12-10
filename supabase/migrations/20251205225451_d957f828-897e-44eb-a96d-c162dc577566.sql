-- Update handle_new_user function to include branch from user metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, branch)
  VALUES (
    new.id, 
    COALESCE(new.raw_user_meta_data ->> 'name', new.email), 
    new.email,
    new.raw_user_meta_data ->> 'branch'
  );
  
  -- Assign default 'staff' role to new users
  INSERT INTO public.user_roles (user_id, role)
  VALUES (new.id, 'staff');
  
  RETURN new;
END;
$$;