import AddExpense from "./form";
import { Metadata } from 'next'

export const metadata:Metadata = {
    title: 'Create New Expense',
}


export default function Page() {
    return (
        <>
            <div className="bg-card p-6 rounded-lg shadow-lg  flex flex-col justify-center items-center">
                <h1 className="text-2xl font-bold mb-4">New Expense</h1>
                <div className="w-1/2">
                   <AddExpense/>
                </div>

            </div>
        </>
    )
}