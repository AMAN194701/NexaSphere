import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { ThemeToggle } from "../ThemeToggle";

// Mock our custom hook useTheme
const mockToggleTheme = jest.fn();
jest.mock("../../../hooks/useTheme", () => ({
  useTheme: () => ({
    isDark: false,
    toggleTheme: mockToggleTheme,
  }),
}));

describe("ThemeToggle Component", () => {
  beforeEach(() => {
    mockToggleTheme.mockClear();
  });

  it("renders without crashing and displays correct aria-label", () => {
    render(<ThemeToggle />);
    const button = screen.getByRole("button", { name: /toggle theme/i });
    expect(button).toBeInTheDocument();
  });

  it("calls toggleTheme on click", () => {
    render(<ThemeToggle />);
    const button = screen.getByRole("button", { name: /toggle theme/i });
    fireEvent.click(button);
    expect(mockToggleTheme).toHaveBeenCalledTimes(1);
  });
});
