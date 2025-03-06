
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString());
    const month = searchParams.get('month') ? parseInt(searchParams.get('month')!) : undefined;

    // Aggregate expenses by category
    const categoryExpenses = await prisma.expense.groupBy({
      by: ['category'],
      where: {
        userId: session.user.id,
        date: {
          gte: new Date(year, month !== undefined ? month - 1 : 0, 1),
          lt: new Date(year, month !== undefined ? month : 12, 1),
        },
      },
      _sum: {
        amount: true,
      },
      orderBy: {
        _sum: {
          amount: 'desc',
        },
      },
    });

    // Get budgets for the same period
    const budgets = await prisma.budget.findMany({
      where: {
        userId: session.user.id,
        year,
        ...(month && { month }),
      },
    });

    // Total expenses for the period
    const totalExpenses = await prisma.expense.aggregate({
      where: {
        userId: session.user.id,
        date: {
          gte: new Date(year, month !== undefined ? month - 1 : 0, 1),
          lt: new Date(year, month !== undefined ? month : 12, 1),
        },
      },
      _sum: {
        amount: true,
      },
    });

    // Calculate budget vs actual for each category
    const budgetComparison = budgets.map(budget => {
      const categoryExpense = categoryExpenses.find(
        exp => exp.category === budget.category
      );
      
      return {
        category: budget.category,
        budgetAmount: budget.amount,
        actualExpense: categoryExpense?._sum.amount || 0,
        difference: (categoryExpense?._sum.amount || 0) - budget.amount,
        percentageUsed: categoryExpense 
          ? (((categoryExpense._sum.amount ?? 0) / budget.amount) * 100).toFixed(2)
          : '0.00'
      };
    });

    return NextResponse.json({
      categoryExpenses,
      totalExpenses: totalExpenses._sum.amount || 0,
      budgetComparison,
    });
  } catch (error) {
    console.error('Error generating report:', error);
    return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 });
  }
}