"use client"

import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface QuickInsightsProps {
  data?: {
    expiry_risk: any[]
    top_sales: any[]
  }
}

export default function QuickInsights({ data }: QuickInsightsProps) {
  const expiryData = data?.expiry_risk || [
    { name: "Aman", value: 0, fill: "#10B981" },
    { name: "Peringatan", value: 0, fill: "#F59E0B" },
    { name: "Kadaluwarsa", value: 0, fill: "#EF4444" },
  ]

  const salesData = data?.top_sales || []
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Expiry Risk Chart */}
      <Card className="bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200">
        <CardHeader className="border-b border-gray-50 pb-4">
          <CardTitle className="text-base font-bold text-gray-800 flex items-center gap-2">
            <span className="w-1 h-4 bg-emerald-500 rounded-full"></span>
            Resiko Kadaluwarsa
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={expiryData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={4}
                dataKey="value"
                stroke="none"
              >
                {expiryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Legend verticalAlign="bottom" height={36} iconType="circle" />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Top Sales Chart */}
      <Card className="bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200">
        <CardHeader className="border-b border-gray-50 pb-4">
          <CardTitle className="text-base font-bold text-gray-800 flex items-center gap-2">
            <span className="w-1 h-4 bg-emerald-500 rounded-full"></span>
            Paling Laku Minggu Ini
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis
                dataKey="name"
                stroke="#9ca3af"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                dy={10}
              />
              <YAxis
                stroke="#9ca3af"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                dx={-10}
              />
              <Tooltip
                cursor={{ fill: '#f9fafb' }}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                formatter={(value) => [`${value} kg/pcs`, 'Terjual']}
              />
              <Bar dataKey="value" fill="#10B981" radius={[6, 6, 0, 0]} maxBarSize={60} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
