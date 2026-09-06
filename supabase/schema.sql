-- =========================================
-- COUTURECAM V2 - Schéma de Base de Données
-- =========================================

-- Activer l'extension pgcrypto pour les UUID
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =========================================
-- 1. TABLES DE PROFIL & UTILISATEURS
-- =========================================

CREATE TYPE role_utilisateur AS ENUM ('client', 'couturier', 'mediateur', 'finance', 'support', 'admin', 'super_admin');
CREATE TYPE statut_verification AS ENUM ('en_attente', 'pret', 'actif', 'refuse');

CREATE TABLE public.profils (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role role_utilisateur DEFAULT 'client'::role_utilisateur,
  telephone VARCHAR(20) UNIQUE NOT NULL,
  nom VARCHAR(100),
  quartier VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.couturiers (
  id UUID PRIMARY KEY REFERENCES public.profils(id) ON DELETE CASCADE,
  nom_atelier VARCHAR(150),
  specialite VARCHAR(255),
  note_moyenne NUMERIC(3, 2) DEFAULT 0.00,
  delai_moyen_jours INT DEFAULT 7,
  statut_verification statut_verification DEFAULT 'en_attente'::statut_verification,
  photo_url TEXT,
  piece_identite_url TEXT,
  photo_atelier_url TEXT,
  geoloc_atelier JSONB,
  references_verifiees JSONB,
  visite_realisee BOOLEAN DEFAULT false,
  badge_actif BOOLEAN DEFAULT false
);

-- =========================================
-- 2. COMMANDES ET ÉTAPES
-- =========================================

CREATE TYPE statut_commande AS ENUM ('en_attente', 'devis_envoye', 'confirmee', 'mesure', 'tissu', 'coupe', 'montage', 'essayage', 'livraison', 'terminee', 'refusee', 'expiree');
CREATE TYPE type_etape AS ENUM ('mesure', 'tissu', 'coupe', 'montage', 'essayage', 'livraison');

CREATE TABLE public.commandes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES public.profils(id) NOT NULL,
  couturier_id UUID REFERENCES public.couturiers(id) NOT NULL,
  titre VARCHAR(255) NOT NULL,
  statut statut_commande DEFAULT 'en_attente'::statut_commande,
  montant_total NUMERIC,
  montant_acompte NUMERIC,
  delai_estime_jours INT,
  message_client TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.etapes_commande (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  commande_id UUID REFERENCES public.commandes(id) ON DELETE CASCADE NOT NULL,
  type_etape type_etape NOT NULL,
  photo_url TEXT,
  geoloc JSONB,
  horodatage TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  validee_par_client BOOLEAN DEFAULT false
);

-- =========================================
-- 3. PAIEMENTS & SÉQUESTRE
-- =========================================

CREATE TYPE type_paiement AS ENUM ('acompte', 'solde');
CREATE TYPE statut_paiement AS ENUM ('en_attente', 'sequestre', 'gele', 'libere', 'rembourse');

CREATE TABLE public.paiements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  commande_id UUID REFERENCES public.commandes(id) NOT NULL,
  montant NUMERIC NOT NULL,
  type type_paiement NOT NULL,
  statut statut_paiement DEFAULT 'en_attente'::statut_paiement,
  provider VARCHAR(50), -- ex: mtn_momo, orange_money
  reference_transaction VARCHAR(255) UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- =========================================
-- 4. MESSAGERIE
-- =========================================

CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  commande_id UUID REFERENCES public.commandes(id) ON DELETE CASCADE NOT NULL,
  expediteur_id UUID REFERENCES public.profils(id) NOT NULL,
  contenu TEXT NOT NULL,
  piece_jointe_url TEXT,
  lu BOOLEAN DEFAULT false,
  is_system BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- =========================================
-- TRIGGERS & RLS (Row Level Security)
-- =========================================

-- Trigger pour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = now(); 
   RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profils_updated_at BEFORE UPDATE ON public.profils FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_commandes_updated_at BEFORE UPDATE ON public.commandes FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_paiements_updated_at BEFORE UPDATE ON public.paiements FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Activer RLS
ALTER TABLE public.profils ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.couturiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commandes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.etapes_commande ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.paiements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Policies Profils
CREATE POLICY "Un utilisateur peut lire et modifier son propre profil" 
ON public.profils FOR ALL USING (auth.uid() = id);

CREATE POLICY "Lecture publique des profils" 
ON public.profils FOR SELECT USING (true);

-- Policies Couturiers
CREATE POLICY "Lecture publique des couturiers" 
ON public.couturiers FOR SELECT USING (true);

-- Policies Commandes (Client voit ses commandes, Couturier voit les siennes)
CREATE POLICY "Lecture commandes liées" 
ON public.commandes FOR SELECT 
USING (auth.uid() = client_id OR auth.uid() = couturier_id);

-- =========================================
-- 5. VUES & PG_CRON
-- =========================================

-- Vue Stats Couturier
CREATE OR REPLACE VIEW public.v_couturier_stats AS
SELECT 
    c.id AS couturier_id,
    c.note_moyenne,
    COUNT(cmd.id) FILTER (WHERE cmd.statut = 'en_attente') AS nb_en_attente,
    COUNT(cmd.id) FILTER (WHERE cmd.statut IN ('mesure', 'tissu', 'coupe', 'montage', 'essayage', 'livraison')) AS nb_en_cours
FROM public.couturiers c
LEFT JOIN public.commandes cmd ON cmd.couturier_id = c.id
GROUP BY c.id, c.note_moyenne;

-- Activer pg_cron (Nécessite Super Admin sur Supabase WAVA)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Job Cron : Expirer les commandes en attente depuis plus de 2 heures
SELECT cron.schedule(
    'expire_commandes_2h',
    '*/5 * * * *', -- Toutes les 5 minutes
    $$
    UPDATE public.commandes
    SET statut = 'expiree'
    WHERE statut = 'en_attente' 
      AND created_at < NOW() - INTERVAL '2 hours';
    $$
);

-- =========================================
-- 6. AUDIT LOG & KYC
-- =========================================

CREATE TABLE public.audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES public.profils(id) NOT NULL,
  action VARCHAR(100) NOT NULL,
  cible_id UUID NOT NULL,
  details JSONB,
  horodatage TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Lecture audit_log pour admin uniquement" ON public.audit_log FOR SELECT USING (EXISTS (SELECT 1 FROM public.profils WHERE id = auth.uid() AND (role = 'admin' OR role = 'super_admin')));
CREATE POLICY "Insert audit_log pour admin uniquement" ON public.audit_log FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.profils WHERE id = auth.uid() AND (role = 'admin' OR role = 'super_admin')));

-- RPC Activation Couturier
CREATE OR REPLACE FUNCTION activer_couturier(p_couturier_id UUID, p_admin_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- 1. Mettre à jour le couturier
  UPDATE public.couturiers
  SET statut_verification = 'actif', badge_actif = true
  WHERE id = p_couturier_id;

  -- 2. Insérer le log
  INSERT INTO public.audit_log (admin_id, action, cible_id, details)
  VALUES (p_admin_id, 'ACTIVATION_COUTURIER', p_couturier_id, '{"motif": "Validation complète du dossier"}');
END;
$$;

-- RLS Commande : Interdire la création si le couturier n'est pas actif
CREATE POLICY "Insert commande uniquement avec couturier actif"
ON public.commandes FOR INSERT
WITH CHECK (
  auth.uid() = client_id AND
  EXISTS (
    SELECT 1 FROM public.couturiers 
    WHERE id = couturier_id AND statut_verification = 'actif'
  )
);

-- =========================================
-- 7. LITIGES & MÉDIATION
-- =========================================

CREATE TYPE acteur_litige AS ENUM ('client', 'couturier');
CREATE TYPE statut_litige AS ENUM ('ouvert', 'instruction', 'clos');

CREATE TABLE public.litiges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  commande_id UUID REFERENCES public.commandes(id) NOT NULL,
  ouvert_par acteur_litige NOT NULL,
  motif TEXT NOT NULL,
  statut statut_litige DEFAULT 'ouvert'::statut_litige,
  date_ouverture TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  date_limite TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now() + interval '5 days') NOT NULL
);

ALTER TABLE public.litiges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Lecture litiges pour admin et liés" ON public.litiges FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profils p WHERE p.id = auth.uid() AND p.role IN ('admin', 'mediateur')) OR
  EXISTS (SELECT 1 FROM public.commandes c WHERE c.id = litiges.commande_id AND (c.client_id = auth.uid() OR c.couturier_id = auth.uid()))
);

-- Trigger pour geler le paiement à l'ouverture d'un litige
CREATE OR REPLACE FUNCTION gele_paiement_on_litige()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.paiements
  SET statut = 'gele'
  WHERE commande_id = NEW.commande_id AND statut = 'sequestre';
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_gele_paiement
AFTER INSERT ON public.litiges
FOR EACH ROW
EXECUTE FUNCTION gele_paiement_on_litige();

-- Vue de l'historique complet (Émule une table de logs chronologiques)
CREATE OR REPLACE VIEW public.v_historique_commande AS
SELECT 
    commande_id,
    'etape' AS type_evenement,
    horodatage,
    'Étape validée : ' || type_etape::text AS description,
    photo_url AS reference_url
FROM public.etapes_commande
UNION ALL
SELECT 
    commande_id,
    'message' AS type_evenement,
    created_at AS horodatage,
    'Message envoyé' AS description,
    NULL AS reference_url
FROM public.messages
UNION ALL
SELECT 
    commande_id,
    'litige' AS type_evenement,
    date_ouverture AS horodatage,
    'Litige ouvert par ' || ouvert_par::text || ' : ' || motif AS description,
    NULL AS reference_url
FROM public.litiges;

-- =========================================
-- 8. FAVORIS (Clients -> Couturiers)
-- =========================================

CREATE TABLE public.favoris (
  client_id UUID REFERENCES public.profils(id) ON DELETE CASCADE NOT NULL,
  couturier_id UUID REFERENCES public.couturiers(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  PRIMARY KEY (client_id, couturier_id)
);

ALTER TABLE public.favoris ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Clients gèrent leurs favoris" ON public.favoris FOR ALL USING (auth.uid() = client_id);
CREATE POLICY "Lecture publique favoris pour compte des stats" ON public.favoris FOR SELECT USING (true);

-- =========================================
-- 9. MARKETING & ACQUISITION
-- =========================================

CREATE TYPE role_interet AS ENUM ('client', 'couturier');

CREATE TABLE public.liste_attente (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL,
  telephone VARCHAR(20),
  ville VARCHAR(100) NOT NULL,
  quartier VARCHAR(100),
  role_interet role_interet DEFAULT 'client'::role_interet,
  source_utm JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(email, ville)
);

ALTER TABLE public.liste_attente ENABLE ROW LEVEL SECURITY;
-- Seuls les admins peuvent lire la table brute
CREATE POLICY "Lecture liste_attente admin uniquement" ON public.liste_attente FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profils p WHERE p.id = auth.uid() AND p.role IN ('admin', 'super_admin'))
);
-- L'insertion brute se fait via l'Edge Function (Service Role Key)

-- Vue publique pour le compteur (anonymisée)
CREATE OR REPLACE VIEW public.v_compteur_attente AS
SELECT 
    ville,
    COUNT(id) AS total_inscrits
FROM public.liste_attente
GROUP BY ville;
