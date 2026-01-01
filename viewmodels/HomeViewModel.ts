// viewmodels/HomeViewModel.ts
// ViewModel for HomeScreen logic and state

import { useEffect, useState } from 'react';
import { getAllDocuments } from '../services/firestore';

export interface HomeItem {
  id: string;
  [key: string]: any;
}

export const useHomeViewModel = (collectionName: string) => {
  const [items, setItems] = useState<HomeItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchItems = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllDocuments(collectionName);
      setItems(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collectionName]);

  return {
    items,
    loading,
    error,
    refresh: fetchItems,
  };
};
