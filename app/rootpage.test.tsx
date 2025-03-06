import { render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import DashboardPage from "./page";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

// Mock dependencies
jest.mock("next-auth/react", () => ({
  useSession: jest.fn(),
}));

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

// Mock fetch
global.fetch = jest.fn();

describe("DashboardPage", () => {
  const mockRouter = { push: jest.fn() };

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    jest.clearAllMocks();
  });

  test("redirects unauthenticated users", () => {
    (useSession as jest.Mock).mockReturnValue({ status: "unauthenticated" });

    render(<DashboardPage />);

    expect(mockRouter.push).toHaveBeenCalledWith("/auth/login");
  });

  test("shows loading screen when session is loading", () => {
    (useSession as jest.Mock).mockReturnValue({ status: "loading" });

    render(<DashboardPage />);
    
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  test("fetches and displays expense summary", async () => {
    (useSession as jest.Mock).mockReturnValue({
      data: { user: { name: "John Doe" } },
      status: "authenticated",
    });

    (global.fetch as jest.Mock).mockResolvedValue({
      json: jest.fn().mockResolvedValue({
        totalExpenses: 1000,
        remainingBudget: 500,
        categoryTotals: [{ name: "Food", value: 700 }, { name: "Travel", value: 300 }],
      }),
    });

    render(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByText("₹1000.00")).toBeInTheDocument();
      expect(screen.getByText("₹1500.00")).toBeInTheDocument();
      expect(screen.getByText("₹500.00")).toBeInTheDocument();
    });
  });

  test("handles API failure gracefully", async () => {
    (useSession as jest.Mock).mockReturnValue({
      data: { user: { name: "John Doe" } },
      status: "authenticated",
    });

    (global.fetch as jest.Mock).mockRejectedValue(new Error("API Error"));

    render(<DashboardPage />);

    await waitFor(() => {
      expect(console.error).toHaveBeenCalled();
    });
  });
});
