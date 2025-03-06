import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

interface ExpenseSummary {
  totalExpenses: number;
  categoryTotals: { name: string; value: number }[];
  remainingBudget: number;
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString());
    const month = parseInt(searchParams.get('month') || (new Date().getMonth() + 1).toString());

    const expenses = await prisma.expense.groupBy({
      by: ['category'],
      where: {
        userId: session.user.id,
        date: {
          gte: new Date(year, month - 1, 1),
          lt: new Date(year, month, 1),
        },
      },
      _sum: {
        amount: true,
      },
    });

    const totalExpenses = expenses.reduce((sum, expense) => sum + (expense._sum.amount || 0), 0);

    const categoryTotals = expenses.map((expense) => ({
      name: expense.category,
      value: expense._sum.amount || 0,
    }));

    const budgets = await prisma.budget.findMany({
      where: {
        userId: session.user.id,
        year,
        month,
      },
    });

    const totalBudget = budgets.reduce((sum, budget) => sum + budget.amount, 0);
    const remainingBudget = totalBudget - totalExpenses;

    const summary: ExpenseSummary = {
      totalExpenses,
      categoryTotals,
      remainingBudget,
    };

    return NextResponse.json(summary);
  } catch (error) {
    console.error('Error fetching expense summary:', error);
    return NextResponse.json({ error: 'Failed to fetch expense summary' }, { status: 500 });
  }
}
