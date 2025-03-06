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

    const categoryExpenses = await prisma.expense.groupBy({
      by: ['category'],
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
      orderBy: {
        _sum: {
          amount: 'desc',
        },
      },
    }).then(results => 
      results.map(result => ({
        category: result.category,
        amount: result._sum.amount || 0
      }))
    );

    // Ensure all categories are included, even if they have no expenses
    const allCategories = ['FOOD', 'TRANSPORT', 'UTILITIES', 'ENTERTAINMENT', 'OTHER'];
    const completeCategoryExpenses = allCategories.map(category => {
      const expense = categoryExpenses.find(exp => exp.category === category);
      return {
        category,
        amount: expense ? expense.amount : 0,
      };
    });

    return NextResponse.json(completeCategoryExpenses);
  } catch (error) {
    console.error('Error generating category expenses report:', error);
    return NextResponse.json({ error: 'Failed to generate category expenses report' }, { status: 500 });
  }
}