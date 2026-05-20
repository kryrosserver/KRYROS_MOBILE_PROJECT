import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface WishlistState {
  items: string[];
  toggleWishlist: (id: string) => void;
  isWishlisted: (id: string) => boolean;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      toggleWishlist: (id) => set((state) => ({
        items: state.items.includes(id) ? state.items.filter(i => i !== id) : [...state.items, id]
      })),
      isWishlisted: (id) => get().items.includes(id),
    }),
    {
      name: 'wishlist-storage',
    }
  )
);
