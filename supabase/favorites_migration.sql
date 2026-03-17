-- Create user_favorites table
CREATE TABLE IF NOT EXISTS public.user_favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    space_id UUID NOT NULL REFERENCES public.spaces(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, space_id)
);

-- Set up Row Level Security (RLS)
ALTER TABLE public.user_favorites ENABLE ROW LEVEL SECURITY;

-- Policy: Users can see their own favorites
CREATE POLICY "Users can view their own favorites"
ON public.user_favorites
FOR SELECT
USING (auth.uid() = user_id);

-- Policy: Users can insert their own favorites
CREATE POLICY "Users can insert their own favorites"
ON public.user_favorites
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own favorites
CREATE POLICY "Users can delete their own favorites"
ON public.user_favorites
FOR DELETE
USING (auth.uid() = user_id);
