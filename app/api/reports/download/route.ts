import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { json2csv } from 'json-2-csv';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString());

    const budgets = await prisma.budget.findMany({
      where: {
        userId: session.user.id,
        year,
      },
      orderBy: { month: 'asc' },
    });

    const expenses = await prisma.expense.groupBy({
      by: ['category', 'date'],
      where: {
        userId: session.user.id,
        date: {
          gte: new Date(year, 0, 1),
          lt: new Date(year + 1, 0, 1),
        },
      },
      _sum: {
        amount: true,
      },
    });

    const report = budgets.map((budget) => {
      const expense = expenses.find(
        (expense) => expense.category === budget.category && expense.date.getMonth() === budget.month
      );
      const totalSpent = expense?._sum?.amount || 0;

      return {
        month: budget.month,
        total_spent: totalSpent,
        category: budget.category,
        budgetAllocated: budget.amount,
      };
    });

    const csv = await json2csv(report);

    return new NextResponse(csv);
  } catch (error) {
    console.error('Error generating report:', error);
    return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 });
  }
}

