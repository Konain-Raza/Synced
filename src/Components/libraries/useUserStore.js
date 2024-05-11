import { create } from 'zustand';

const useUserStore = create((set) => ({
    CurrentUser: null,
    isLoading: true,
    fetchUserInfo: async (uid) => {
        if (!uid) {
            return set({ CurrentUser: null, isLoading: false });
            try {
            } catch (error) {
                console.log(error);
                return set({ CurrentUser: null, isLoading: false });

            }
        }
    }
}));
