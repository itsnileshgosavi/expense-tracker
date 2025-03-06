"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useMonthlyExpenses, useCategoryExpenses } from "@/hooks/useExpenseReports"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { Download } from "lucide-react"
import Loading from "../loading"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#FF6384"]

export default function ReportsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [year, setYear] = useState(new Date().getFullYear().toString())

  const { monthlyExpenses, fetchMonthlyExpenses, loading } = useMonthlyExpenses()
  const { categoryExpenses, fetchCategoryExpenses, loading: categoryLoading } = useCategoryExpenses()

  useEffect(() => {
    fetchMonthlyExpenses(Number(year))
    fetchCategoryExpenses(Number(year))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [year])

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    }
  }, [status, router]);

  const downloadReport = async () => {
    try {
      const response = await fetch(`/api/reports/download?year=${year}`)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `expense-report-${year}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error("Failed to download report:", error)
    }
  }

  if (loading || categoryLoading) return <Loading />

  return (
    <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold">Expense Reports</h1>
        <div className="flex flex-col xs:flex-row w-full sm:w-auto gap-3 sm:gap-4">
          <Select value={year} onValueChange={setYear}>
            <SelectTrigger className="w-full xs:w-[120px]">
              <SelectValue placeholder="Select Year" />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 5 }, (_, i) => {
                const year = new Date().getFullYear() - i
                return (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                )
              })}
            </SelectContent>
          </Select>
          <Button onClick={downloadReport} className="w-full xs:w-auto">
            <Download className="mr-2 h-4 w-4" />
            <span className="whitespace-nowrap">Download Report</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-xl sm:text-2xl">Monthly Expenses ({year})</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px] sm:h-[400px] p-2 sm:p-6">
            <ChartContainer
              config={{
                amount: {
                  label: "Amount (₹)",
                  color: "hsl(var(--chart-1))",
                },
              }}
              className="w-full h-full"
            >
              <BarChart
                data={monthlyExpenses}
                margin={{
                  top: 10,
                  right: 10,
                  left: 10,
                  bottom: 20,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} fontSize={12} />
                <YAxis tickLine={false} axisLine={false} tickMargin={8} fontSize={12} />
                <ChartTooltip content={<ChartTooltipContent />} cursor={false} />
                <Legend wrapperStyle={{ fontSize: "12px", marginTop: "10px" }} />
                <Bar dataKey="amount" fill="var(--color-amount)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-xl sm:text-2xl">Expenses by Category ({year})</CardTitle>
          </CardHeader>
          <CardContent className="h-[350px] sm:h-[400px] md:h-[450px] p-2 sm:p-6">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryExpenses}
                  dataKey="amount"
                  nameKey="category"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  innerRadius={0}
                  fill="#8884d8"
                  paddingAngle={1}
                  label={({ name, value, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {categoryExpenses.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => `₹${value}`}
                  contentStyle={{
                    borderRadius: "8px",
                    padding: "8px 12px",
                    boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
                  }}
                />
                <Legend
                  layout="horizontal"
                  verticalAlign="bottom"
                  align="center"
                  wrapperStyle={{
                    fontSize: "12px",
                    paddingTop: "20px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

