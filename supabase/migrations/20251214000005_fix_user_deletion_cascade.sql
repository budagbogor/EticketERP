-- Migration to enable ON DELETE CASCADE for foreign keys referencing auth.users

-- 1. Modify public.complaints
DO $$ 
BEGIN
  -- Drop existing constraints if they exist (naming convention often varies, so we try specific names or discover them)
  -- For safety, we try to drop by finding the constraint name or standard Supabase logic
  
  -- Handle 'created_by'
  IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE table_name = 'complaints' AND constraint_type = 'FOREIGN KEY') THEN
    ALTER TABLE public.complaints DROP CONSTRAINT IF EXISTS complaints_created_by_fkey;
    ALTER TABLE public.complaints DROP CONSTRAINT IF EXISTS complaints_assigned_to_fkey;
  END IF;

  -- Re-add with CASCADE
  ALTER TABLE public.complaints
    ADD CONSTRAINT complaints_created_by_fkey
    FOREIGN KEY (created_by)
    REFERENCES auth.users(id)
    ON DELETE CASCADE;

  -- Re-add with SET NULL for assignments (we don't want to delete the ticket if assignee is deleted)
  ALTER TABLE public.complaints
    ADD CONSTRAINT complaints_assigned_to_fkey
    FOREIGN KEY (assigned_to)
    REFERENCES auth.users(id)
    ON DELETE SET NULL;

END $$;

-- 2. Modify public.complaint_history
DO $$ 
BEGIN
  ALTER TABLE public.complaint_history DROP CONSTRAINT IF EXISTS complaint_history_performed_by_fkey;

  ALTER TABLE public.complaint_history
    ADD CONSTRAINT complaint_history_performed_by_fkey
    FOREIGN KEY (performed_by)
    REFERENCES auth.users(id)
    ON DELETE CASCADE;
END $$;

-- 3. Modify public.technical_reports (if exists)
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'technical_reports') THEN
    ALTER TABLE public.technical_reports DROP CONSTRAINT IF EXISTS technical_reports_technician_id_fkey;
    
    -- Assuming a column like 'technician_id' or 'created_by' exists. 
    -- We check columns first to be safe.
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'technical_reports' AND column_name = 'technician_id') THEN
        ALTER TABLE public.technical_reports
          ADD CONSTRAINT technical_reports_technician_id_fkey
          FOREIGN KEY (technician_id)
          REFERENCES auth.users(id)
          ON DELETE SET NULL;
    END IF;
    
     IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'technical_reports' AND column_name = 'created_by') THEN
        ALTER TABLE public.technical_reports DROP CONSTRAINT IF EXISTS technical_reports_created_by_fkey;
        
        ALTER TABLE public.technical_reports
          ADD CONSTRAINT technical_reports_created_by_fkey
          FOREIGN KEY (created_by)
          REFERENCES auth.users(id)
          ON DELETE CASCADE;
    END IF;
  END IF;
END $$;

-- 4. Check user_roles and profiles (should already be CASCADE but reinforcing)
DO $$
BEGIN
    ALTER TABLE public.user_roles DROP CONSTRAINT IF EXISTS user_roles_user_id_fkey;
    ALTER TABLE public.user_roles ADD CONSTRAINT user_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

    ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;
    ALTER TABLE public.profiles ADD CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;
END $$;
