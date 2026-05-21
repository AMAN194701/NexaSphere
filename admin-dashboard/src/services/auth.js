import { API_BASE_URL } from "../config";

export const adminLogin = async (email, password) => {

  const response = await fetch(
    `${API_BASE_URL}/api/admin/login`,
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        email,
        password,
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Login Failed");
  }

  return data;
};