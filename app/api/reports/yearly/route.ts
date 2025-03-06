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

    const currentYear = new Date().getFullYear();
    const startYear = currentYear - 4;

    const yearlyExpenses = await prisma.expense.groupBy({
      by: ['date'],
      where: {
        userId: session.user.id,
        date: {
          gte: new Date(startYear, 0, 1),
          lt: new Date(currentYear + 1, 0, 1),
        },
      },
      _sum: {
        amount: true,
      },
    });

    const expensesByYear = Array.from({ length: 5 }, (_, i) => {
      const year = startYear + i;
      const yearExpenses = yearlyExpenses.filter(expense => 
        new Date(expense.date).getFullYear() === year
      );
      const totalAmount = yearExpenses.reduce((sum, expense) => 
        sum + (expense._sum.amount || 0), 0
      );
      
      return {
        year,
        amount: totalAmount || 0,
      };
    });

    return NextResponse.json(expensesByYear);
  } catch (error) {
    console.error('Error generating yearly expense report:', error);
    return NextResponse.json({ error: 'Failed to generate yearly expense report' }, { status: 500 });
  }
}
