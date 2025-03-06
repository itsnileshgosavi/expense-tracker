// hooks/useBudgets.ts
import { useState } from 'react';
import axios from 'axios';

// Type definitions
interface Budget {
  id: string;
  amount: number;
  category: string;
  spent: number;
  month: number;
  year: number;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export const useBudgets = () => {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBudgets = async (
    year = new Date().getFullYear(), 
    month= new Date().getMonth(),
    category?: string
  ) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        year: year.toString(),
        month: month.toString(),
        ...(category && { category })
      });

      const { data } = await axios.get<Budget[]>(`/api/budgets?${params}`);
      setBudgets(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const createBudget = async (budget: Omit<Budget, 'id' | 'userId' | 'createdAt' | 'updatedAt' | "spent">) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axios.post<Budget>('/api/budgets', budget);
      setBudgets(prev => [data, ...prev]);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateBudget = async (
    id: string, 
    budget: Omit<Budget, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
  ) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axios.put<Budget>(`/api/budgets/${id}`, budget);
      setBudgets(prev => prev.map(b => b.id === id ? data : b));
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteBudget = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await axios.delete(`/api/budgets/${id}`);
      setBudgets(prev => prev.filter(b => b.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    budgets,
    loading,
    error,
    fetchBudgets,
    createBudget,
    updateBudget,
    deleteBudget
  };
};