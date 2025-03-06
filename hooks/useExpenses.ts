// hooks/useExpenses.ts
import { useState } from 'react';
import axios from 'axios';

// Type definitions
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

interface ExpensePagination {
  currentPage: number;
  totalPages: number;
  totalExpenses: number;
}

export const useExpenses = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [pagination, setPagination] = useState<ExpensePagination>({
    currentPage: 1,
    totalPages: 0,
    totalExpenses: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchExpenses = async (
    page = 1, 
    limit = 10, 
    category?: string
  ) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(category && { category })
      });

      const { data } = await axios.get<{
        expenses: Expense[];
        pagination: ExpensePagination;
      }>(`/api/expenses?${params}`);

      setExpenses(data.expenses);
      setPagination(data.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const createExpense = async (expense: Omit<Expense, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axios.post<Expense>('/api/expenses', expense);
      setExpenses(prev => [data, ...prev]);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateExpense = async (
    id: string, 
    expense: Omit<Expense, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
  ) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axios.put<Expense>(`/api/expenses/${id}`, expense);
      setExpenses(prev => prev.map(exp => exp.id === id ? data : exp));
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteExpense = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await axios.delete(`/api/expenses/${id}`);
      setExpenses(prev => prev.filter(exp => exp.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    expenses,
    pagination,
    loading,
    error,
    fetchExpenses,
    createExpense,
    updateExpense,
    deleteExpense
  };
};