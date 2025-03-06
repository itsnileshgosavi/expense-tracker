"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { format, set, isWithinInterval, parseISO } from "date-fns"
import { Plus, Filter, X } from "lucide-react"
import { useExpenses } from "@/hooks/useExpenses"
import Loading from "../loading"
import { Card } from "@/components/ui/card"
import { Dialog, DialogContent} from "@/components/ui/dialog"
import EditExpense from "./editExpenseform"

interface Expense {
  id: string;
  amount: number;
  description: string;
  category: string;
  date: Date;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export default function ExpensesPage() {
  const { data: session, status } = useSession()
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const [filters, setFilters] = useState({
    category: "",
    startDate: "",
    endDate: "",
    minAmount: "",
    maxAmount: "",
  })
  const [filteredExpenses, setFilteredExpenses] = useState<Expense[]>([])
  const [editingExpense, setEditingExpense] = useState({
    category: "",
    amount: 0,
    description: "",
    date: "",
    id: "",
  })

  const { expenses, loading, fetchExpenses, deleteExpense } = useExpenses()

  // Apply filters to expenses
  const applyFilters = () => {
    let filtered = [...expenses]

    if (filters.category && filters.category !== "all") {
      filtered = filtered.filter(expense => expense.category === filters.category)
    }

    if (filters.startDate && filters.endDate) {
      filtered = filtered.filter(expense => {
        const expenseDate = new Date(expense.date)
        return isWithinInterval(expenseDate, {
          start: parseISO(filters.startDate),
          end: parseISO(filters.endDate)
        })
      })
    } else if (filters.startDate) {
      filtered = filtered.filter(expense => {
        const expenseDate = new Date(expense.date)
        return expenseDate >= parseISO(filters.startDate)
      })
    } else if (filters.endDate) {
      filtered = filtered.filter(expense => {
        const expenseDate = new Date(expense.date)
        return expenseDate <= parseISO(filters.endDate)
      })
    }

    if (filters.minAmount) {
      filtered = filtered.filter(expense => expense.amount >= Number(filters.minAmount))
    }

    if (filters.maxAmount) {
      filtered = filtered.filter(expense => expense.amount <= Number(filters.maxAmount))
    }

    setFilteredExpenses(filtered)
  }

  // Reset all filters
  const resetFilters = () => {
    setFilters({
      category: "",
      startDate: "",
      endDate: "",
      minAmount: "",
      maxAmount: "",
    })
    setFilteredExpenses(expenses)
  }

  useEffect(() => {
    if (fetchExpenses) {
      fetchExpenses()
    }
    //eslint-disable-next-line
  }, [])

  useEffect(() => {
    setFilteredExpenses(expenses)
  }, [expenses])

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login")
    }
  }, [status, router])

  const handleDelete = async (id: string) => {
    try {
      await deleteExpense(id)
      applyFilters()
    } catch (error) {
      console.error("Failed to delete expense:", error)
    }
  }

  if (status === "loading" || loading) return <Loading />

  return (
    <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold">Expenses</h1>
        <Button onClick={() => router.push("/expenses/new")} className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" /> Add Expense
        </Button>
      </div>

      <Card className="p-4 mb-6">
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2 sm:gap-4">
            <div className="w-full sm:w-auto">
              <Select
                value={filters.category}
                onValueChange={(value) => setFilters({ ...filters, category: value === "all" ? "" : value })}
              >
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="FOOD">Food</SelectItem>
                  <SelectItem value="TRANSPORT">Transport</SelectItem>
                  <SelectItem value="UTILITIES">Utilities</SelectItem>
                  <SelectItem value="ENTERTAINMENT">Entertainment</SelectItem>
                  <SelectItem value="OTHER">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="w-full xs:w-[calc(50%-0.25rem)] sm:w-auto">
              <Input
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                className="w-full sm:w-[180px]"
                placeholder="Start Date"
              />
            </div>

            <div className="w-full xs:w-[calc(50%-0.25rem)] sm:w-auto">
              <Input
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                className="w-full sm:w-[180px]"
                placeholder="End Date"
              />
            </div>

            <div className="w-full xs:w-[calc(50%-0.25rem)] sm:w-auto">
              <Input
                type="number"
                placeholder="Min Amount"
                value={filters.minAmount}
                onChange={(e) => setFilters({ ...filters, minAmount: e.target.value })}
                className="w-full sm:w-[140px]"
              />
            </div>

            <div className="w-full xs:w-[calc(50%-0.25rem)] sm:w-auto">
              <Input
                type="number"
                placeholder="Max Amount"
                value={filters.maxAmount}
                onChange={(e) => setFilters({ ...filters, maxAmount: e.target.value })}
                className="w-full sm:w-[140px]"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button onClick={applyFilters} variant="secondary" className="w-full xs:w-auto">
              <Filter className="mr-2 h-4 w-4" /> Apply Filters
            </Button>
            <Button onClick={resetFilters} variant="outline" className="w-full xs:w-auto">
              <X className="mr-2 h-4 w-4" /> Reset Filters
            </Button>
          </div>
        </div>
      </Card>

      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredExpenses.length > 0 ? (
              filteredExpenses.map((expense) => (
                <TableRow key={expense.id}>
                  <TableCell>{format(new Date(expense.date), "MMM d, yyyy")}</TableCell>
                  <TableCell className="max-w-[200px] truncate">{expense.description}</TableCell>
                  <TableCell>{expense.category}</TableCell>
                  <TableCell className="text-right">₹{expense.amount.toFixed(2)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="sm" onClick={() => { setEditingExpense({ ...expense, date: new Date(expense.date).toDateString() }); setOpen(true); }}>
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(expense.id)}
                        className="text-destructive"
                      >
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                  No expenses found. Try adjusting your filters or add a new expense.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <EditExpense fdata={editingExpense} />
        </DialogContent>
      </Dialog>
    </div>
  )
}

