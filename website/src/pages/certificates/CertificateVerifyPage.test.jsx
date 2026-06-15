import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import CertificateVerifyPage from "./CertificateVerifyPage";
import apiClient from "../../api/apiClient";

vi.mock("../../api/apiClient");

describe("CertificateVerifyPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the verify form", () => {
    render(<CertificateVerifyPage />);
    expect(screen.getByLabelText(/certificate id/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /verify/i })
    ).toBeInTheDocument();
  });

  it("calls apiClient.get with the correct relative path (not a hardcoded fetch)", async () => {
    apiClient.get = vi.fn().mockResolvedValue({
      data: { name: "Jane Doe", course: "React 101", issuedAt: "2024-01-15T00:00:00.000Z" },
    });

    render(<CertificateVerifyPage />);

    fireEvent.change(screen.getByLabelText(/certificate id/i), {
      target: { value: "CERT-12345" },
    });
    fireEvent.click(screen.getByRole("button", { name: /verify/i }));

    await waitFor(() => {
      expect(apiClient.get).toHaveBeenCalledWith(
        "/certificates/verify/CERT-12345"
      );
    });
  });

  it("does NOT call the global fetch() function", async () => {
    const globalFetchSpy = vi.spyOn(globalThis, "fetch");
    apiClient.get = vi.fn().mockResolvedValue({ data: {} });

    render(<CertificateVerifyPage />);

    fireEvent.change(screen.getByLabelText(/certificate id/i), {
      target: { value: "CERT-99999" },
    });
    fireEvent.click(screen.getByRole("button", { name: /verify/i }));

    await waitFor(() => {
      expect(apiClient.get).toHaveBeenCalled();
    });

    expect(globalFetchSpy).not.toHaveBeenCalled();
    globalFetchSpy.mockRestore();
  });

  it("displays certificate details on successful verification", async () => {
    apiClient.get = vi.fn().mockResolvedValue({
      data: {
        name: "John Smith",
        course: "Advanced Node.js",
        issuedAt: "2024-06-01T00:00:00.000Z",
      },
    });

    render(<CertificateVerifyPage />);

    fireEvent.change(screen.getByLabelText(/certificate id/i), {
      target: { value: "CERT-ABC" },
    });
    fireEvent.click(screen.getByRole("button", { name: /verify/i }));

    await waitFor(() => {
      expect(screen.getByRole("status")).toBeInTheDocument();
    });

    expect(screen.getByText(/certificate verified/i)).toBeInTheDocument();
    expect(screen.getByText(/john smith/i)).toBeInTheDocument();
    expect(screen.getByText(/advanced node\.js/i)).toBeInTheDocument();
  });

  it("displays an error message when verification fails", async () => {
    apiClient.get = vi.fn().mockRejectedValue({
      response: { data: { message: "Certificate not found" } },
    });

    render(<CertificateVerifyPage />);

    fireEvent.change(screen.getByLabelText(/certificate id/i), {
      target: { value: "CERT-INVALID" },
    });
    fireEvent.click(screen.getByRole("button", { name: /verify/i }));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toBeInTheDocument();
    });

    expect(screen.getByText(/certificate not found/i)).toBeInTheDocument();
  });

  it("shows a fallback error message when the error has no response body", async () => {
    apiClient.get = vi.fn().mockRejectedValue(new Error("Network Error"));

    render(<CertificateVerifyPage />);

    fireEvent.change(screen.getByLabelText(/certificate id/i), {
      target: { value: "CERT-XYZ" },
    });
    fireEvent.click(screen.getByRole("button", { name: /verify/i }));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toBeInTheDocument();
    });

    expect(screen.getByText(/network error/i)).toBeInTheDocument();
  });

  it("disables the submit button while loading", async () => {
    let resolveRequest;
    apiClient.get = vi.fn(
      () =>
        new Promise((resolve) => {
          resolveRequest = resolve;
        })
    );

    render(<CertificateVerifyPage />);

    fireEvent.change(screen.getByLabelText(/certificate id/i), {
      target: { value: "CERT-LOADING" },
    });
    fireEvent.click(screen.getByRole("button", { name: /verify/i }));

    expect(screen.getByRole("button", { name: /verifying/i })).toBeDisabled();

    resolveRequest({ data: {} });

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /verify/i })
      ).not.toBeDisabled();
    });
  });
});
