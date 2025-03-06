"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/Progress";
import { Plus } from "lucide-react";
import { useBudgets } from "@/hooks/useBudgets";
import Loading from "../loading";
import { toast } from "@/hooks/use-toast"; 
import { AxiosError } from "axios";

interface newBudget {
  category: "FOOD" | "ENTERTAINMENT" | "TRANSPORT" | "OTHER" | "UTILITIES";
  amount: string;
  month: number;
  year: number;
}

export default function BudgetsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [newBudget, setNewBudget] = useState<newBudget>({
    category: "OTHER",
    amount: "",
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

  const {
    updateBudget,
    loading,
    budgets,
    deleteBudget,
    fetchBudgets,
    createBudget,
  } = useBudgets();

  useEffect(() => {
    fetchBudgets(selectedYear, selectedMonth);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedYear, selectedMonth]);
  
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    }
  }, [status, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createBudget({
        ...newBudget,
        amount: parseFloat(newBudget.amount),
      });
      setIsDialogOpen(false);
      await fetchBudgets();
      setNewBudget({
        category: "OTHER",
        amount: "",
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
      });
    } catch (error) {
      console.error("Failed to create budget:", error);
      if(error instanceof AxiosError && error.response?.data.error.includes("Budget already exists")){
        toast({
          title: "Budget already exists",
          description: "You already have a budget for this category, month, and year.",
          variant: "destructive",
        })
      }
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteBudget(id);
      await fetchBudgets();
    } catch (error) {
      console.error("Failed to delete budget:", error);
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl lg:text-3xl font-bold">Budget Management</h1>
        <div className="flex gap-4 flex-col-reverse lg:flex-row">
          <Select
            value={selectedMonth.toString()}
            onValueChange={(value) => setSelectedMonth(parseInt(value))}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Select Month" />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 12 }, (_, i) => (
                <SelectItem key={i + 1} value={(i + 1).toString()}>
                  {new Date(0, i).toLocaleString("default", { month: "long" })}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={selectedYear.toString()}
            onValueChange={(value) => setSelectedYear(parseInt(value))}
          >
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Select Year" />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 5 }, (_, i) => {
                const year = new Date().getFullYear() - 2 + i;
                return (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" /> Add Budget
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Budget</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <Select
                  value={newBudget.category}
                  onValueChange={(value) =>
                    setNewBudget({
                      ...newBudget,
                      category: value as newBudget["category"],
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FOOD">Food</SelectItem>
                    <SelectItem value="TRANSPORT">Transport</SelectItem>
                    <SelectItem value="UTILITIES">Utilities</SelectItem>
                    <SelectItem value="ENTERTAINMENT">Entertainment</SelectItem>
                    <SelectItem value="OTHER">Other</SelectItem>
                  </SelectContent>
                </Select>

                <Input
                  type="number"
                  placeholder="Amount"
                  value={newBudget.amount}
                  onChange={(e) =>
                    setNewBudget({ ...newBudget, amount: e.target.value })
                  }
                />

                <Select
                  value={newBudget.month.toString()}
                  onValueChange={(value) =>
                    setNewBudget({ ...newBudget, month: parseInt(value) })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Month" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 12 }, (_, i) => (
                      <SelectItem key={i + 1} value={(i + 1).toString()}>
                        {new Date(0, i).toLocaleString("default", {
                          month: "long",
                        })}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Input
                  type="number"
                  placeholder="Year"
                  value={newBudget.year}
                  onChange={(e) =>
                    setNewBudget({ ...newBudget, year: parseInt(e.target.value) })
                  }
                />

                <Button type="submit" className="w-full">
                  Create Budget
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {budgets.length === 0 && (
          <div className="text-center col-span-3 text-gray-500">No budgets found.</div>
        )}
        {budgets.map((budget) => (
          <Card key={budget.id}>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span className="capitalize">{budget.category}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(budget.id)}
                  className="text-destructive"
                >
                  Delete
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Spent: ₹{budget.spent.toFixed(2)}</span>
                    <span>Budget: ₹{budget.amount.toFixed(2)}</span>
                  </div>
                  <Progress
                    value={
                      budget.amount > 0
                        ? Math.min((budget.spent / budget.amount) * 100, 100)
                        : 0
                    }
                    className="h-2"
                  />
                </div>
                <div className="text-sm text-muted-foreground">
                  {new Date(0, budget.month - 1).toLocaleString("default", {
                    month: "long",
                  })}{" "}
                  {budget.year}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
