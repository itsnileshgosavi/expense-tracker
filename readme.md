# Expense Tracker

Expense Tracker lets you track your monthly expenses, view reports and create budgets.This app lets helps you in managing expenses, budgets, and generating financial reports for a personal finance application. All endpoints require authentication using NextAuth.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [Features](#features)

## Installation

Instructions on how to install and set up your project. Include any prerequisites and commands needed to get your project running.

```bash
# Example command
git clone https://github.com/itsnileshgosavi/expense-tracker.git
cd expense-tracker
pnpm install
```

Add .env file according .env.example

```bash
pnpm dev
```

## Features

List the features of your project. This helps users understand what they can do with it.

- Add, edit. delete expenses.
- Add, edit, delete budgets.
- view expenses monthly in reports.



## Base URL

All API routes are relative to your application's base URL:

```
https://yourdomain.com/api/
```

## Authentication

All API endpoints are protected and require authentication using NextAuth. Requests without valid authentication will receive a 401 Unauthorized response.

---

## Expense Endpoints

### Get All Expenses

Retrieves a paginated list of expenses for the authenticated user.

- **URL**: `/api/expenses`
- **Method**: `GET`
- **Query Parameters**:
  - `page` (optional): Page number for pagination (default: 1)
  - `limit` (optional): Number of items per page (default: 10)
  - `category` (optional): Filter expenses by category

**Response**:
```json
{
  "expenses": [
    {
      "id": "clq...",
      "amount": 42.99,
      "description": "Groceries",
      "category": "Food",
      "date": "2024-02-15T00:00:00.000Z",
      "userId": "clp...",
      "createdAt": "2024-02-15T14:30:00.000Z",
      "updatedAt": "2024-02-15T14:30:00.000Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalExpenses": 42
  }
}
```

### Create Expense

Creates a new expense entry.

- **URL**: `/api/expenses`
- **Method**: `POST`
- **Body**:
```json
{
  "amount": 42.99,
  "description": "Groceries",
  "category": "Food",
  "date": "2024-02-15T00:00:00.000Z"
}
```

**Response**: The created expense object

### Get Single Expense

Retrieves a specific expense by ID.

- **URL**: `/api/expenses/:id`
- **Method**: `GET`

**Response**: The expense object

### Update Expense

Updates an existing expense.

- **URL**: `/api/expenses/:id`
- **Method**: `PUT`
- **Body**:
```json
{
  "amount": 45.99,
  "description": "Weekly Groceries",
  "category": "Food",
  "date": "2024-02-15T00:00:00.000Z"
}
```

**Response**: The updated expense object

### Delete Expense

Deletes an expense.

- **URL**: `/api/expenses/:id`
- **Method**: `DELETE`

**Response**:
```json
{
  "message": "Expense deleted successfully"
}
```

---

## Budget Endpoints

### Get All Budgets

Retrieves all budgets for the authenticated user, optionally filtered by year and category.

- **URL**: `/api/budgets`
- **Method**: `GET`
- **Query Parameters**:
  - `year` (optional): Filter by year (default: current year)
  - `category` (optional): Filter by category

**Response**:
```json
[
  {
    "id": "clq...",
    "amount": 500,
    "category": "Food",
    "month": 2,
    "year": 2024,
    "userId": "clp...",
    "createdAt": "2024-01-31T14:30:00.000Z",
    "updatedAt": "2024-01-31T14:30:00.000Z"
  }
]
```

### Create Budget

Creates a new budget entry.

- **URL**: `/api/budgets`
- **Method**: `POST`
- **Body**:
```json
{
  "amount": 500,
  "category": "Food",
  "month": 2,
  "year": 2024
}
```

**Notes**: Cannot create duplicate budgets for the same month, category, and year.

**Response**: The created budget object

### Get Single Budget

Retrieves a specific budget by ID.

- **URL**: `/api/budgets/:id`
- **Method**: `GET`

**Response**: The budget object

### Update Budget

Updates an existing budget.

- **URL**: `/api/budgets/:id`
- **Method**: `PUT`
- **Body**:
```json
{
  "amount": 600,
  "category": "Food",
  "month": 2,
  "year": 2024
}
```

**Response**: The updated budget object

### Delete Budget

Deletes a budget.

- **URL**: `/api/budgets/:id`
- **Method**: `DELETE`

**Response**:
```json
{
  "message": "Budget deleted successfully"
}
```

---

## Report Endpoints

### Financial Report

Generates a comprehensive financial report including expense categories, budget comparisons, and total expenses.

- **URL**: `/api/reports`
- **Method**: `GET`
- **Query Parameters**:
  - `year` (optional): Year for the report (default: current year)
  - `month` (optional): Month for the report (if omitted, returns data for the entire year)

**Response**:
```json
{
  "categoryExpenses": [
    {
      "category": "Food",
      "_sum": {
        "amount": 420.75
      }
    }
  ],
  "totalExpenses": 1250.45,
  "budgetComparison": [
    {
      "category": "Food",
      "budgetAmount": 500,
      "actualExpense": 420.75,
      "difference": -79.25,
      "percentageUsed": "84.15"
    }
  ]
}
```

### Monthly Expenses Report

Retrieves expenses aggregated by month for a specified year.

- **URL**: `/api/reports/monthly`
- **Method**: `GET`
- **Query Parameters**:
  - `year` (optional): Year for the report (default: current year)

**Response**:
```json
[
  {
    "month": "January",
    "amount": 1250.45
  },
  {
    "month": "February",
    "amount": 1100.20
  }
]
```

### Category Expenses Report

Retrieves expenses aggregated by category for a specified year.

- **URL**: `/api/reports/category`
- **Method**: `GET`
- **Query Parameters**:
  - `year` (optional): Year for the report (default: current year)

**Response**:
```json
[
  {
    "category": "Food",
    "amount": 4500.65
  },
  {
    "category": "Transport",
    "amount": 3200.10
  }
]
```

---

## Error Responses

All endpoints return standardized error responses:

### 400 Bad Request
```json
{
  "error": "Missing required fields"
}
```

### 401 Unauthorized
```json
{
  "error": "Unauthorized"
}
```

### 404 Not Found
```json
{
  "error": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Failed to process request"
}
```

---

## React Hooks

The API can be consumed using the following custom React hooks:

- `useExpenses()`: Manages expense data and operations
- `useBudgets()`: Manages budget data and operations
- `useReports()`: Retrieves comprehensive financial reports
- `useMonthlyExpenses()`: Retrieves expenses aggregated by month
- `useCategoryExpenses()`: Retrieves expenses aggregated by category

Each hook provides loading states, error handling, and data management.

## View Routes

The frontend consist of the following routes.

- `/auth/login` : Login Route
- `/auth/register` : Register Route

- `/` : An overview of the expenses and Budgets
- `/budgets` : Route to add and delete budgets
- `/expenses` : Route to view/edit and delete expenses
- `/expenses/new` : Route to create a new expense
- `/reports` : Route to view/download reports yearly 

## Contact

Provide your contact information or links to your social media profiles for users to reach out with questions or feedback.

- Your Name - [nilesh@craftmymenu.com](mailto:nilesh@craftmymenu.com)
- GitHub: [itsnileshgosavi](https://github.com/itsnileshgosavi)
