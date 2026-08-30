import { redirect } from 'next/navigation'

export default function Home() {
  // En phase de pré-lancement, on redirige la racine vers la landing page pilote (Douala par défaut)
  redirect('/bientot/douala')
}
