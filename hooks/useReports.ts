// hooks/useReports.ts
import { useState } from 'react';
import axios from 'axios';

// Type definitions for reporting
interface CategoryExpense {
  category: string;
  _sum: {
    amount: number;
  };
}

interface BudgetComparison {
  category: string;
  budgetAmount: number;
  actualExpense: number;
  difference: number;
  percentageUsed: string;
}

interface FinancialReport {
  categoryExpenses: CategoryExpense[];
  totalExpenses: number;
  budgetComparison: BudgetComparison[];
}

export const useReports = () => {
  const [report, setReport] = useState<FinancialReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReport = async (
    year = new Date().getFullYear(), 
    month?: number
  ) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        year: year.toString(),
        ...(month && { month: month.toString() })
      });

      const { data } = await axios.get<FinancialReport>(`/api/reports?${params}`);
      setReport(data);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    report,
    loading,
    error,
    fetchReport
  };
};