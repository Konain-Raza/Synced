
import { create } from 'zustand';
import { doc, getDoc } from "firebase/firestore";
import { db } from '../firebase-config'
import useUserStore from './userStore';

const useChatStore = create((set) => ({
  chatId: null,
  user: true,
  isCurrentUserBlocked: false,
  isRecieverBlocked: false,  
  changeChat: (chatId, user) => {
    const currentUser = useUserStore.getState().currentUser;
    // Check if user is blocked
    // Check if receiver is blocked
    if (user.blocked.includes(currentUser.id)) {
      return set({
        chatId,
        user: true,
        isCurrentUserBlocked: true,
        isRecieverBlocked: false,  
      });
    } else if (currentUser.blocked.includes(user.id)) {
      return set({
        chatId,
        user,
        isCurrentUserBlocked: false,
        isRecieverBlocked: true,  
      });
    } else {
      return set({
        chatId,
        user,
        isCurrentUserBlocked: false,
        isRecieverBlocked: false,  
      });
    }
  },
  changeBlock: () => {
    set((state) => ({ ...state, isRecieverBlocked: !state.isRecieverBlocked }));
  }
}));

export { useChatStore };
