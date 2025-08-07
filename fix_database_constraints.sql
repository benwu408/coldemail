-- Fix Database Constraints SQL Script
-- This script adds the missing RPC functions for database constraint management

-- Function to get table constraints
CREATE OR REPLACE FUNCTION get_table_constraints(table_name text)
RETURNS TABLE(
  constraint_name text,
  constraint_type text,
  column_name text
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    tc.constraint_name::text,
    tc.constraint_type::text,
    kcu.column_name::text
  FROM information_schema.table_constraints tc
  LEFT JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
  WHERE tc.table_name = $1
    AND tc.table_schema = 'public'
  ORDER BY tc.constraint_type, tc.constraint_name;
END;
$$;

-- Function to drop search_mode constraints
CREATE OR REPLACE FUNCTION drop_search_mode_constraints()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  constraint_record RECORD;
  dropped_count INTEGER := 0;
BEGIN
  -- Find and drop any CHECK constraints on search_mode column
  FOR constraint_record IN
    SELECT constraint_name
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu 
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    WHERE tc.table_name = 'generated_emails'
      AND tc.table_schema = 'public'
      AND tc.constraint_type = 'CHECK'
      AND kcu.column_name = 'search_mode'
  LOOP
    EXECUTE 'ALTER TABLE generated_emails DROP CONSTRAINT IF EXISTS ' || constraint_record.constraint_name;
    dropped_count := dropped_count + 1;
  END LOOP;
  
  RETURN 'Dropped ' || dropped_count || ' constraints on search_mode column';
END;
$$;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION get_table_constraints(text) TO authenticated;
GRANT EXECUTE ON FUNCTION drop_search_mode_constraints() TO authenticated;

-- Also grant to service role (for API calls)
GRANT EXECUTE ON FUNCTION get_table_constraints(text) TO service_role;
GRANT EXECUTE ON FUNCTION drop_search_mode_constraints() TO service_role; 