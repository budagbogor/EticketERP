-- Create Forum Categories Table
CREATE TABLE IF NOT EXISTS forum_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    icon TEXT, -- Lucide icon name or image URL
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create Forum Threads Table
CREATE TABLE IF NOT EXISTS forum_threads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    category_id UUID NOT NULL REFERENCES forum_categories(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    is_pinned BOOLEAN DEFAULT FALSE,
    is_resolved BOOLEAN DEFAULT FALSE,
    view_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create Forum Posts (Replies) Table
CREATE TABLE IF NOT EXISTS forum_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    thread_id UUID NOT NULL REFERENCES forum_threads(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES forum_posts(id) ON DELETE SET NULL, -- For nested replies if needed
    is_solution BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_forum_threads_category_id ON forum_threads(category_id);
CREATE INDEX IF NOT EXISTS idx_forum_threads_author_id ON forum_threads(author_id);
CREATE INDEX IF NOT EXISTS idx_forum_posts_thread_id ON forum_posts(thread_id);
CREATE INDEX IF NOT EXISTS idx_forum_posts_author_id ON forum_posts(author_id);

-- Enable RLS
ALTER TABLE forum_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_posts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Categories (Public Read, Admin Write)
CREATE POLICY "Categories are viewable by everyone" ON forum_categories
    FOR SELECT USING (true);

-- Assuming we don't have a formal admin role check yet in SQL efficiently without a helper,
-- we'll allow Authenticated insert for now or restrict it to manual seeding. 
-- For now: RESTRICT INSERT/UPDATE/DELETE to service_role or future admin check.
-- To allow users to see, we must have SELECT policy. DONE.

-- RLS Policies for Threads
CREATE POLICY "Threads are viewable by everyone" ON forum_threads
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create threads" ON forum_threads
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update their own threads" ON forum_threads
    FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "Users can delete their own threads" ON forum_threads
    FOR DELETE USING (auth.uid() = author_id);

-- RLS Policies for Posts
CREATE POLICY "Posts are viewable by everyone" ON forum_posts
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create posts" ON forum_posts
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update their own posts" ON forum_posts
    FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "Users can delete their own posts" ON forum_posts
    FOR DELETE USING (auth.uid() = author_id);


-- Seed Default Categories
INSERT INTO forum_categories (name, slug, description, icon) VALUES
('Komplain Pelanggan', 'komplain-pelanggan', 'Diskusi mengenai penanganan komplain dan kepuasan pelanggan', 'MessageCircleWarning'),
('Masalah Produk', 'masalah-produk', 'Laporan dan diskusi mengenai isu teknis pada produk', 'Wrench'),
('Tools & Equipment', 'tools-equipment', 'Diskusi mengenai penggunaan dan perawatan alat bengkel', 'Hammer'),
('Problem Solving', 'problem-solving', 'Sharing solusi untuk masalah teknis yang sulit', 'Lightbulb'),
('Info Revisi', 'info-revisi', 'Update terbaru mengenai revisi buku pintar atau SOP', 'FileText'),
('Lainnya', 'lainnya', 'Diskusi umum lainnya', 'MessageSquare')
ON CONFLICT (slug) DO NOTHING;
