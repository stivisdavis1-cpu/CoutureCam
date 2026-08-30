import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://okhjkkscbdknurtciltk.supabase.co'
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

async function seedTestUser() {
  console.log('Création du compte de test (client@couturecam.com)...')
  
  // 1. Créer l'utilisateur dans Auth
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: 'client@couturecam.com',
    password: 'password123',
    email_confirm: true,
    user_metadata: { role: 'client' }
  })

  if (authError) {
    if (authError.message.includes('already been registered')) {
      console.log('L\'utilisateur de test existe déjà dans Auth.')
    } else {
      console.error('Erreur Auth:', authError)
      return
    }
  } else {
    console.log('✅ Utilisateur Auth créé avec succès:', authData.user.id)
    
    // 2. L'ajouter à la table profils (le trigger handle_new_user n'existe peut-être pas)
    const { error: profilError } = await supabase.from('profils').upsert({
      id: authData.user.id,
      role: 'client',
      telephone: '237690000000',
      nom: 'Client Test',
      quartier: 'Bonapriso'
    })

    if (profilError) {
      console.error('Erreur création profil:', profilError)
    } else {
      console.log('✅ Profil client créé avec succès dans la table public.profils.')
    }
  }

  // 3. Créer quelques couturiers de test pour que la recherche donne des résultats
  console.log('Création de quelques couturiers vérifiés pour la recherche...')
  const couturiers = [
    { nom_atelier: 'Atelier Manuela', specialite: 'Tenues traditionnelles', quartier: 'Bonapriso', note_moyenne: 4.8, delai_moyen_jours: 3, role: 'couturier', tel: '237690000001', photo_url: '/avatars/c2.png' },
    { nom_atelier: 'Jean Kouotou Couture', specialite: 'Costumes sur mesure', quartier: 'Akwa', note_moyenne: 4.9, delai_moyen_jours: 5, role: 'couturier', tel: '237690000002', photo_url: '/avatars/c1.png' },
    { nom_atelier: 'Maison Ndop', specialite: 'Broderie et Ndop', quartier: 'Deido', note_moyenne: 4.7, delai_moyen_jours: 7, role: 'couturier', tel: '237690000003', photo_url: '/avatars/c3.png' }
  ]

  for (const c of couturiers) {
    // Auth
    let userId;
    const { data: cAuth, error: authErr } = await supabase.auth.admin.createUser({
      email: `couturier_${c.tel}@test.com`,
      password: 'password123',
      email_confirm: true,
      user_metadata: { role: 'couturier' }
    })

    if (authErr && authErr.message.includes('already been registered')) {
        // Fetch the user ID
        const { data: { users } } = await supabase.auth.admin.listUsers()
        const existing = users.find(u => u.email === `couturier_${c.tel}@test.com`)
        if (existing) userId = existing.id
    } else if (cAuth?.user) {
        userId = cAuth.user.id
    }

    if (userId) {
      // Profil
      await supabase.from('profils').upsert({
        id: userId,
        role: c.role,
        telephone: c.tel,
        nom: c.nom_atelier,
        quartier: c.quartier
      })

      // Couturier
      await supabase.from('couturiers').upsert({
        id: userId,
        nom_atelier: c.nom_atelier,
        specialite: c.specialite,
        note_moyenne: c.note_moyenne,
        delai_moyen_jours: c.delai_moyen_jours,
        statut_verification: 'actif',
        badge_actif: true,
        photo_url: c.photo_url
      })
      console.log(`✅ Couturier ${c.nom_atelier} inséré avec succès.`)
    }
  }

  // 4. Créer un Admin
  console.log('Création du compte Admin...')
  let adminId;
  const { data: adminAuth, error: adminErr } = await supabase.auth.admin.createUser({
    email: 'admin@couturecam.com',
    password: 'password123',
    email_confirm: true,
    user_metadata: { role: 'admin' }
  })

  if (adminErr && adminErr.message.includes('already been registered')) {
    const { data: { users } } = await supabase.auth.admin.listUsers()
    const existing = users.find(u => u.email === 'admin@couturecam.com')
    if (existing) adminId = existing.id
  } else if (adminAuth?.user) {
    adminId = adminAuth.user.id
  }

  if (adminId) {
    await supabase.from('profils').upsert({
      id: adminId,
      role: 'admin',
      telephone: '237690000009',
      nom: 'Admin Principal',
      quartier: 'Akwa'
    })
    console.log('✅ Admin créé avec succès.')
  }

  console.log('Terminé ! Vous pouvez vous connecter avec client@couturecam.com / password123')
}

seedTestUser()
