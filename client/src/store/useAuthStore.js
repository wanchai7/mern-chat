import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

const BASE_URL = import.meta.env.MODE === "development" ? "http://localhost:5000" : "/";

export const useAuthStore = create(
    devtools((set, get) => ({
        authUser: null,
        isRegistering: false,
        isLoggingIn: false,
        isUpdatingProfile: false,
        isCheckingAuth: true,
        onlineUsers: [],
        socket: null,

        checkAuth: async () => {
            try {
                const res = await axiosInstance.get("/check");
                set({ authUser: res.data });
                get().connectSocket();
            } catch (error) {
                console.log("Error in checkAuth:", error);
                set({ authUser: null });
            } finally {
                set({ isCheckingAuth: false });
            }
        },

        register: async (data) => {
            set({ isRegistering: true });
            try {
                const res = await axiosInstance.post("/register", data);
                set({ authUser: res.data });
                toast.success("Account created successfully");
                get().connectSocket();
            } catch (error) {
                toast.error(error.response.data.message);
            } finally {
                set({ isRegistering: false });
            }
        },

        login: async (data) => {
            set({ isLoggingIn: true });
            try {
                const res = await axiosInstance.post("/login", data);
                set({ authUser: res.data });
                toast.success("Logged in successfully");
                get().connectSocket();
            } catch (error) {
                toast.error(error.response.data.message);
            } finally {
                set({ isLoggingIn: false });
            }
        },

        logout: async () => {
            try {
                await axiosInstance.post("/logout");
                set({ authUser: null });
                toast.success("Logged out successfully");
                get().disconnectSocket();
            } catch (error) {
                toast.error(error.response.data.message);
            }
        },

        updateProfile: async (data) => {
            set({ isUpdatingProfile: true });
            try {
                const res = await axiosInstance.put("/update-profile", data);
                set({ authUser: res.data });
                toast.success("Profile updated successfully");
            } catch (error) {
                console.log("error in update profile:", error);
                toast.error(error.response.data.message);
            } finally {
                set({ isUpdatingProfile: false });
            }
        },

        connectSocket: () => {
            const { authUser } = get();
            if (!authUser || get().socket?.connected) return;

            const socket = io(BASE_URL, {
                query: {
                    userId: authUser._id,
                },
            });
            socket.connect();

            set({ socket: socket });

            socket.on("getOnlineUsers", (userIds) => {
                set({ onlineUsers: userIds });
            });
        },
        disconnectSocket: () => {
            if (get().socket?.connected) get().socket.disconnect();
        },
    }), { name: "AuthStore" }));
