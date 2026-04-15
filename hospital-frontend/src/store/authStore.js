import { create } from "zustand";

const safeJsonParse = (value, fallback) => {
    try {
        return JSON.parse(value);
    } catch {
        return fallback;
    }
};

const getStoredToken = () => localStorage.getItem("token") || "";
const getStoredUser = () => safeJsonParse(localStorage.getItem("user") || "null", null);

const useAuthStore = create((set) => ({
    token: getStoredToken(),
    user: getStoredUser(),
    loading: false,

    setAuth: ({ token, user }) => {
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
        set({ token, user });
    },

    logout: () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        set({ token: "", user: null });
    },

    setLoading: (loading) => set({ loading }),
}));

export default useAuthStore;