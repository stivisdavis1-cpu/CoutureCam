'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts'

const dataGMV = [
  { name: 'Sep', gmv: 4000000 },
  { name: 'Oct', gmv: 5200000 },
  { name: 'Nov', gmv: 6100000 },
  { name: 'Dec', gmv: 8500000 },
  { name: 'Jan', gmv: 7200000 },
  { name: 'Fev', gmv: 9100000 },
  { name: 'Mar', gmv: 10500000 },
  { name: 'Avr', gmv: 11200000 },
  { name: 'Mai', gmv: 10800000 },
  { name: 'Jun', gmv: 11500000 },
  { name: 'Jul', gmv: 12000000 },
  { name: 'Aou', gmv: 12400000 },
]

const dataQuartiers = [
  { name: 'Akwa', commandes: 420, gmv: 4500000 },
  { name: 'Bonanjo', commandes: 310, gmv: 3800000 },
  { name: 'Deido', commandes: 280, gmv: 2100000 },
  { name: 'Bonamoussadi', commandes: 190, gmv: 1500000 },
  { name: 'Bali', commandes: 80, gmv: 500000 },
]

export default function DashboardCharts() {
  return (
    <>
      <Card className="border-0 shadow-sm rounded-3xl bg-white overflow-hidden">
        <CardHeader className="border-b border-border/50 pb-4">
          <CardTitle className="text-lg font-bold text-navy">Tendance GMV (12 mois)</CardTitle>
        </CardHeader>
        <CardContent className="p-6 pt-8 h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={dataGMV} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12 }} dy={10} />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#64748B', fontSize: 12 }} 
                tickFormatter={(val) => `${(val / 1000000).toFixed(1)}M`}
              />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
                formatter={(value: any) => [`${value.toLocaleString()} FCFA`, 'GMV']}
              />
              <Line type="monotone" dataKey="gmv" stroke="#C9A84C" strokeWidth={4} dot={{ r: 4, fill: '#C9A84C', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6, fill: '#1B2A4A', stroke: '#fff' }} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm rounded-3xl bg-white overflow-hidden">
        <CardHeader className="border-b border-border/50 pb-4">
          <CardTitle className="text-lg font-bold text-navy">Répartition par Quartier</CardTitle>
        </CardHeader>
        <CardContent className="p-6 pt-8 h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dataQuartiers} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12 }} dy={10} />
              <YAxis yAxisId="left" orientation="left" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12 }} />
              <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12 }} tickFormatter={(val) => `${(val / 1000000).toFixed(1)}M`} />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
              />
              <Legend wrapperStyle={{ paddingTop: '20px' }} />
              <Bar yAxisId="left" dataKey="commandes" name="Nb Commandes" fill="#1B2A4A" radius={[4, 4, 0, 0]} barSize={30} />
              <Bar yAxisId="right" dataKey="gmv" name="Volume GMV" fill="#C1633B" radius={[4, 4, 0, 0]} barSize={30} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </>
  )
}
