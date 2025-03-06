// hooks/useExpenseReports.ts
import { useState } from 'react';
import axios from 'axios';

interface MonthlyExpense {
  month: string;
  amount: number;
}
interface YearlyExpenses {
  year: string;
  amount: number;
}

interface CategoryExpense {
  category: string;
  amount: number;
}

export const useMonthlyExpenses = () => {
  const [monthlyExpenses, setMonthlyExpenses] = useState<MonthlyExpense[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMonthlyExpenses = async (year = new Date().getFullYear()) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axios.get<MonthlyExpense[]>(`/api/reports/monthly?year=${year}`);
      setMonthlyExpenses(data);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { monthlyExpenses, loading, error, fetchMonthlyExpenses };
};
export const useYearlyExpenses = () => {
  const [yearlyExpenses, setYearlyExpenses] = useState<YearlyExpenses[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchYearlyExpenses = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axios.get<YearlyExpenses[]>(`/api/reports/yearly`);
      setYearlyExpenses(data);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { yearlyExpenses, loading, error, fetchYearlyExpenses };
};

export const useCategoryExpenses = () => {
  const [categoryExpenses, setCategoryExpenses] = useState<CategoryExpense[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCategoryExpenses = async (year = new Date().getFullYear()) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axios.get<CategoryExpense[]>(`/api/reports/category?year=${year}`);
      setCategoryExpenses(data);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { categoryExpenses, loading, error, fetchCategoryExpenses };
};