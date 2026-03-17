-- Add RLS policy to allow guests to update their own bookings (e.g., for cancellations)
CREATE POLICY "Users can update their own bookings" 
ON public.bookings 
FOR UPDATE 
USING (auth.uid() = user_id);
