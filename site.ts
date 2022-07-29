import { serve } from "https://deno.land/std@0.142.0/http/server.ts";

serve(async () => {
  const md = await Deno.readTextFile('./README.md')
  const res = await fetch('https://md2html.deno.dev', {
    method: 'POST',
    body: md
  })
  return res
})

