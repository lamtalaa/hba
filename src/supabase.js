import { createClient } from '@supabase/supabase-js';

// eslint-disable-next-line no-undef
const supabaseUrl = "https://bxvvgybmjfeyzipodeeb.supabase.co/";
// eslint-disable-next-line no-undef
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ4dnZneWJtamZleXppcG9kZWViIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDc2MjYzMjIsImV4cCI6MjAyMzIwMjMyMn0.tbTtS96NWKCoOZxvNw4goVreM3YEfAPgGoLANk3tou8";

export const supabase = createClient(supabaseUrl, supabaseKey);