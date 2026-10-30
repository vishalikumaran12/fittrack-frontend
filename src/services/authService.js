import API from "./api";

export const registerUser = async (userData) => {
  const response = await API.post("/auth/register", userData);
  return response.data;
};

export const loginUser = async (userData) => {
  const response = await API.post("/auth/login", userData);

  if (response.data.token) {
    localStorage.setItem("fittrack-token", response.data.token);
    localStorage.setItem(
      "fittrack-current-user",
      JSON.stringify(response.data.user)
    );
  }

  return response.data;
};

export const logoutUser = () => {
  localStorage.removeItem("fittrack-token");
  localStorage.removeItem("fittrack-current-user");
};