import { create } from 'zustand';

import { profileUser, savedAddresses } from '@/data/profile';

type UserState = {
  name: string;
  phone: string;
  location: string;
  addressId: string;
  wallet: number;
  unread: number;
  favorites: string[];
  setLocation: (location: string) => void;
  setAddress: (id: string) => void;
  markNotificationsRead: () => void;
  toggleFavorite: (id: string) => void;
  topUpWallet: (amount: number) => void;
};

export const useUserStore = create<UserState>((set) => ({
  name: profileUser.name,
  phone: profileUser.phone,
  location: profileUser.address,
  addressId: savedAddresses.find((address) => address.isDefault)?.id ?? 'home',
  wallet: profileUser.walletBalance,
  unread: 3,
  favorites: ['a2-cow-milk'],
  setLocation: (location) => set({ location }),
  setAddress: (id) => {
    const address = savedAddresses.find((entry) => entry.id === id);
    set({ addressId: id, location: address ? `${address.label}, ${address.line2.split(',')[0]}` : 'Bengaluru' });
  },
  markNotificationsRead: () => set({ unread: 0 }),
  toggleFavorite: (id) =>
    set((state) => ({
      favorites: state.favorites.includes(id)
        ? state.favorites.filter((favorite) => favorite !== id)
        : [...state.favorites, id],
    })),
  topUpWallet: (amount) => set((state) => ({ wallet: state.wallet + amount })),
}));
