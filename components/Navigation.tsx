"use client"
import React from 'react';
import Link from 'next/link';
import { useSession, signIn, signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';

const Navbar = () => {
  const { data: session } = useSession();

  return (
    <nav className="flex justify-between items-center p-4 bg-card shadow-md">
      <Link href="/" className="text-lg lg:text-xl font-bold text-primary">
        Finance Tracker
      </Link>
      <div className="flex items-center space-x-1 lg:space-x-4 text-xs lg:text-lg">
        {session ? (
          <>
            <Link href="/expenses" className="hover:text-blue-600">
              Expenses
            </Link>
            <Link href="/budgets" className="hover:text-blue-600">
              Budgets
            </Link>
            <Link href="/reports" className="hover:text-blue-600">
              Reports
            </Link>
            <Button size={'icon'} onClick={() => signOut()} variant="destructive">
              <LogOut/>
            </Button>
          </>
        ) : (
          <Button onClick={() => signIn()} variant="default">
            Login
          </Button>
        )}
      </div>
    </nav>
  );
};

const Footer = () => {
  return (
    <footer className="bg-card/70 text-foreground/50 p-4 text-center">
      <div className="container mx-auto">
        <p>&copy; 2025 Finance Tracker. All rights reserved.</p>
      </div>
    </footer>
  );
};

export { Navbar, Footer };