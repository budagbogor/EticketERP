-- Migration to sync role changes from app_users to user_roles
-- This ensures that when an admin updates a role in the UI (app_users), 
-- the system permissions (user_roles) are automatically updated.

CREATE OR REPLACE FUNCTION public.sync_app_user_role_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Cycle check: prevent infinite recursion if updates loop (though unlikely here)
  -- Logic: If role changed, update user_roles
  
  IF NEW.role IS DISTINCT FROM OLD.role THEN
    -- 1. Remove existing role entry for this user (Enforce 1 active role concept for this flow)
    DELETE FROM public.user_roles WHERE user_id = NEW.id;
    
    -- 2. Insert new role
    -- Note: We cast to text first, then to app_role enum to match types
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, NEW.role::text::public.app_role);
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger: After Update on app_users
DROP TRIGGER IF EXISTS on_app_user_role_change ON public.app_users;
CREATE TRIGGER on_app_user_role_change
  AFTER UPDATE OF role ON public.app_users
  FOR EACH ROW EXECUTE FUNCTION public.sync_app_user_role_change();

-- Manual Sync: Apply current app_users state to user_roles for any immediate consistency
DO $$
DECLARE
  r RECORD;
BEGIN
  -- Loop through all app_users
  FOR r IN SELECT id, role FROM public.app_users LOOP
    -- Delete any user_roles that DO NOT match the app_user role
    DELETE FROM public.user_roles 
    WHERE user_id = r.id AND role IS DISTINCT FROM r.role::text::public.app_role;
    
    -- Insert the correct role if it doesn't exist
    INSERT INTO public.user_roles (user_id, role)
    VALUES (r.id, r.role::text::public.app_role)
    ON CONFLICT (user_id, role) DO NOTHING;
  END LOOP;
  
  RAISE NOTICE 'Role synchronization completed';
END $$;
