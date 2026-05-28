import { createClient } from "@supabase/supabase-js"

const supabaseUrl = "https://kawfxctucxlswvporjbi.supabase.co"

const supabaseKey = "sb_publishable_n_zpXCRMAfNfvPEcNfZJkQ_ZymkeTFJ"

export const supabase = createClient(
  supabaseUrl,
  supabaseKey
)