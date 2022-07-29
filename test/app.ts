import { serve } from "https://deno.land/std@0.142.0/http/server.ts";

serve((_) => {
  return new Response("HELLO WORLD")
})
