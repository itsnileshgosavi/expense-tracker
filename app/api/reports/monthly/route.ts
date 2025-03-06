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

    const monthlyExpenses = await prisma.expense.groupBy({
      by: ['date'],
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

    const expensesByMonth = Array.from({ length: 12 }, (_, i) => {
      const monthExpense = monthlyExpenses.find(expense => new Date(expense.date).getMonth() === i);
      return {
        month: new Date(0, i).toLocaleString('default', { month: 'long' }),
        amount: monthExpense ? monthExpense._sum.amount : 0,
      };
    });

    return NextResponse.json(expensesByMonth);
  } catch (error) {
    console.error('Error generating monthly expense report:', error);
    return NextResponse.json({ error: 'Failed to generate monthly expense report' }, { status: 500 });
  }
}
