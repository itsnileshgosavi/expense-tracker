
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { json2csv } from 'json-2-csv';

type Category = 'FOOD' | 'UTILITIES' | 'ENTERTAINMENT' | 'TRANSPORT' | 'OTHER';

// Get all budgets for the authenticated user
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString());
    const month = parseInt(searchParams.get('month') || (new Date().getMonth() + 1).toString());
    const category = searchParams.get('category') as Category | undefined;

    const budgets = await prisma.budget.findMany({
      where: {
        userId: session.user.id,
        year,
        month,
        ...(category && { category }),
      },
      orderBy: { createdAt: 'desc' },
    });

    const expenses = await prisma.expense.groupBy({
      by: ['category'],
      where: {
        userId: session.user.id,
        date: {
          gte: new Date(year, month - 1, 1),
          lt: new Date(year, month, 1),
        },
        ...(category && { category }),
      },
      _sum: {
        amount: true,
      },
    });
    const budgetsWithExpenses = budgets.map((budget) => ({
      ...budget,
      spent: expenses.find((expense) => expense.category === budget.category)?._sum.amount || 0,
    }));

    return NextResponse.json(budgetsWithExpenses);
  } catch (error) {
    console.error('Error fetching budgets:', error);
    return NextResponse.json({ error: 'Failed to fetch budgets' }, { status: 500 });
  }
}

// Create a new budget
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { amount, category, month, year } = body;

    // Validate input
    if (!amount || !category || !month || !year) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check for existing budget in the same month and category
    const existingBudget = await prisma.budget.findFirst({
      where: {
        userId: session.user.id,
        category,
        month,
        year,
      },
    });

    if (existingBudget) {
      return NextResponse.json({ error: 'Budget already exists for this month and category' }, { status: 400 });
    }

    const budget = await prisma.budget.create({
      data: {
        amount: parseFloat(amount),
        category,
        month: parseInt(month),
        year: parseInt(year),
        userId: session.user.id,
      },
    });

    return NextResponse.json(budget, { status: 201 });
  } catch (error) {
    console.error('Error creating budget:', error);
    return NextResponse.json({ error: 'Failed to create budget' }, { status: 500 });
  }
}