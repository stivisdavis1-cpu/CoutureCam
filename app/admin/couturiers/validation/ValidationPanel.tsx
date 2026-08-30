'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { FileText, CheckCircle2, AlertCircle } from 'lucide-react'

// Ceci pourrait utiliser Sheet de shadcn/ui dans un cas réel
export default function ValidationPanel({ couturier }: { couturier: any }) {
  const [isOpen, setIsOpen] = useState(false)
  const [checklist, setChecklist] = useState({
    cni: false,
    photo_atelier: false,
    geoloc: false,
    references: false,
    visite: false
  })

  const allChecked = Object.values(checklist).every(Boolean)

  const handleActiver = async () => {
    // Appel RPC : activer_couturier(couturier.id)
    // Log dans audit_log
    console.log("Couturier activé, log enregistré.")
    setIsOpen(false)
  }

  return (
    <>
      <Button variant="outline" className="rounded-full flex items-center gap-2" onClick={() => setIsOpen(true)}>
        <FileText className="w-4 h-4" /> Voir le dossier
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex justify-end">
          <div className="bg-white w-full max-w-md h-full shadow-2xl p-6 overflow-y-auto flex flex-col animate-in slide-in-from-right duration-300">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-navy">Dossier: {couturier.nom_atelier}</h2>
              <Button variant="ghost" onClick={() => setIsOpen(false)}>Fermer</Button>
            </div>

            <div className="flex-1 space-y-6">
              <div className="bg-muted/30 p-4 rounded-xl border border-border">
                <h3 className="font-semibold mb-3">Checklist KYC (Mode Opératoire 3.1)</h3>
                
                <div className="space-y-3">
                  {Object.entries(checklist).map(([key, val]) => (
                    <label key={key} className="flex items-center gap-3 p-2 hover:bg-white rounded-lg cursor-pointer transition-colors">
                      <input 
                        type="checkbox" 
                        className="w-5 h-5 rounded border-input text-primary focus:ring-primary"
                        checked={val}
                        onChange={(e) => setChecklist(prev => ({...prev, [key]: e.target.checked}))}
                      />
                      <span className="text-sm capitalize">{key.replace('_', ' ')}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="bg-terracotta/10 p-4 rounded-xl text-sm text-terracotta flex gap-2">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <p>Toute action d'activation ou de refus est définitive et sera consignée dans le journal d'audit de la plateforme.</p>
              </div>
            </div>

            <div className="pt-6 border-t border-border flex gap-3 mt-auto">
              <Button variant="outline" className="flex-1 rounded-full border-red text-red hover:bg-red/10">Refuser</Button>
              <Button 
                className="flex-1 rounded-full bg-emerald hover:bg-emerald/90 text-white" 
                disabled={!allChecked}
                onClick={handleActiver}
              >
                Activer le profil
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
