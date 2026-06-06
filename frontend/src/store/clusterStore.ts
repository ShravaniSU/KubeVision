import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ClusterStore {
  activeClusterId: string | null;
  setActiveCluster: (id: string | null) => void;
}

export const useClusterStore = create<ClusterStore>()(
  persist(
    (set) => ({
      activeClusterId: null,
      setActiveCluster: (id) => set({ activeClusterId: id }),
    }),
    { name: 'kubevision-cluster' }
  )
);
