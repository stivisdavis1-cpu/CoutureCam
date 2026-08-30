import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.resolve(__dirname, '../.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY // Use service role to bypass RLS for checking

const supabase = createClient(supabaseUrl, supabaseKey)

async function check() {
  const { data: users, error: userError } = await supabase.auth.admin.listUsers()
  const clientUser = users.users.find(u => u.email === 'client@couturecam.com')
  
  if (clientUser) {
    const { data: profile } = await supabase.from('profils').select('*').eq('id', clientUser.id).single()
    console.log("Profile in DB:", profile)
    
    // Let's try to update it using RLS to simulate what happens
    const { data: { user, session }, error: authError } = await supabase.auth.signInWithPassword({
        email: 'client@couturecam.com',
        password: 'password123'
    })
    if (authError) {
        console.log("Auth error:", authError)
        return
    }
    
    const userClient = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
      global: {
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      }
    })
    
    const updateRes = await userClient.from('profils').update({ nom: 'Test Edit' }).eq('id', user.id)
    console.log("Update via userClient:", updateRes)
    
    const { data: newProfile } = await supabase.from('profils').select('*').eq('id', clientUser.id).single()
    console.log("Profile after edit:", newProfile)
  }
}

check()
