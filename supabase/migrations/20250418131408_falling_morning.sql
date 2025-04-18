/*
  # Add Map Features

  1. New Tables
    - map_locations
      - id (uuid)
      - user_id (uuid)
      - title (text)
      - description (text)
      - image_url (text[])
      - latitude (double precision)
      - longitude (double precision)
      - created_at (timestamptz)
    
    - map_routes
      - id (uuid)
      - user_id (uuid)
      - title (text)
      - description (text)
      - image_url (text[])
      - route_data (jsonb)
      - created_at (timestamptz)

  2. Security
    - Enable RLS
    - Add policies for authenticated users
*/

-- Create map_locations table
CREATE TABLE IF NOT EXISTS map_locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  image_url text[],
  latitude double precision NOT NULL,
  longitude double precision NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create map_routes table
CREATE TABLE IF NOT EXISTS map_routes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  image_url text[],
  route_data jsonb NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE map_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE map_routes ENABLE ROW LEVEL SECURITY;

-- Create policies for map_locations
DO $$ BEGIN
  DROP POLICY IF EXISTS "Locations are viewable by everyone" ON map_locations;
  DROP POLICY IF EXISTS "Users can create locations" ON map_locations;
  DROP POLICY IF EXISTS "Users can update own locations" ON map_locations;
  DROP POLICY IF EXISTS "Users can delete own locations" ON map_locations;

  CREATE POLICY "Locations are viewable by everyone"
    ON map_locations
    FOR SELECT
    TO authenticated
    USING (true);

  CREATE POLICY "Users can create locations"
    ON map_locations
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

  CREATE POLICY "Users can update own locations"
    ON map_locations
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id);

  CREATE POLICY "Users can delete own locations"
    ON map_locations
    FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create policies for map_routes
DO $$ BEGIN
  DROP POLICY IF EXISTS "Routes are viewable by everyone" ON map_routes;
  DROP POLICY IF EXISTS "Users can create routes" ON map_routes;
  DROP POLICY IF EXISTS "Users can update own routes" ON map_routes;
  DROP POLICY IF EXISTS "Users can delete own routes" ON map_routes;

  CREATE POLICY "Routes are viewable by everyone"
    ON map_routes
    FOR SELECT
    TO authenticated
    USING (true);

  CREATE POLICY "Users can create routes"
    ON map_routes
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

  CREATE POLICY "Users can update own routes"
    ON map_routes
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id);

  CREATE POLICY "Users can delete own routes"
    ON map_routes
    FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create storage bucket for map images
INSERT INTO storage.buckets (id, name, public)
VALUES ('map-images', 'map-images', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies
DO $$ BEGIN
  DROP POLICY IF EXISTS "Map images are publicly accessible" ON storage.objects;
  DROP POLICY IF EXISTS "Users can upload map images" ON storage.objects;
  DROP POLICY IF EXISTS "Users can update own map images" ON storage.objects;
  DROP POLICY IF EXISTS "Users can delete own map images" ON storage.objects;

  CREATE POLICY "Map images are publicly accessible"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'map-images');

  CREATE POLICY "Users can upload map images"
    ON storage.objects FOR INSERT
    WITH CHECK (
      bucket_id = 'map-images' AND
      auth.role() = 'authenticated'
    );

  CREATE POLICY "Users can update own map images"
    ON storage.objects FOR UPDATE
    USING (
      bucket_id = 'map-images' AND
      auth.role() = 'authenticated'
    );

  CREATE POLICY "Users can delete own map images"
    ON storage.objects FOR DELETE
    USING (
      bucket_id = 'map-images' AND
      auth.role() = 'authenticated'
    );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;