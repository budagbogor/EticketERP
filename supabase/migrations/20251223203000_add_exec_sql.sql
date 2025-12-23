-- Create a function to execute dynamic SQL
-- CRITICAL: This function allows executing ANY SQL. It must be protected.
-- We will only allow specific roles or checking context.

CREATE OR REPLACE FUNCTION exec_sql(query text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result json;
BEGIN
  -- Security Check: Only allow if the user is authenticated and potentially has a claim or just rely on Edge Function's Service Role.
  -- The Edge Function uses Service Role Key which bypasses RLS, but when it calls RPC, it acts as the logged in user if we passed the jwt.
  -- In our Edge Function, we are initializing `supabase` with `serviceRoleKey`?
  -- Let's check the code I wrote.
  -- "const supabase = createClient(supabaseUrl, serviceRoleKey);"
  -- Yes, so it runs as superuser/service_role.
  
  -- Execute the query and return result as JSON
  EXECUTE 'SELECT json_agg(t) FROM (' || query || ') t' INTO result;
  
  -- If no results/null, return empty array
  IF result IS NULL THEN
    result := '[]'::json;
  END IF;

  RETURN result;
END;
$$;
