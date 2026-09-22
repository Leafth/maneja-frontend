const apiUrl = process.env.EXPO_PUBLIC_API_URL;

if (!apiUrl) {
  throw new Error("A variável EXPO_PUBLIC_API_URL não foi configurada.");
}

export const API_CONFIG = {
  baseURL: apiUrl,
  timeout: 10000,
};
