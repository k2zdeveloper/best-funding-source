import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../../lib/supabase';

export interface FullUserProfile {
  id: string;
  email: string;
  role: string;
  company_name: string | null;
  industry: string | null;
  revenue: string | null;
  loan_amount: string | null;
  aum: string | null;
  is_accredited: boolean;
  is_verified: boolean;
  is_blocked: boolean;
  prevent_deletion: boolean;
  restricted_until: string | null;
  created_at: string;
}

export type SortOption = 'newest' | 'oldest' | 'a-z' | 'z-a';

export const useAdminDirectory = () => {
  const [paginatedUsers, setPaginatedUsers] = useState<FullUserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalItems, setTotalItems] = useState(0);
  
  // --- UI Controls State ---
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // --- 1. PERFORMANCE: Search Debouncer ---
  // Prevents querying the database on every single keystroke. 
  // Waits until the user stops typing for 300ms before triggering the fetch.
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1); // Reset to page 1 on new search
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Reset to page 1 when other filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [roleFilter, sortBy]);

  // --- 2. SECURITY & PERFORMANCE: Server-Side Query Engine ---
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Initialize query with exact count for pagination math
      let query = supabase
        .from('profiles')
        .select('*', { count: 'exact' });

      // Apply Role Filter
      if (roleFilter !== 'all') {
        query = query.eq('role', roleFilter);
      }

      // Apply Search (Case-insensitive ILIKE search)
      if (debouncedSearch) {
        // Securely searches both email and company_name without fetching all rows
        query = query.or(`email.ilike.%${debouncedSearch}%,company_name.ilike.%${debouncedSearch}%`);
      }

      // Apply Sorting
      switch (sortBy) {
        case 'newest':
          query = query.order('created_at', { ascending: false });
          break;
        case 'oldest':
          query = query.order('created_at', { ascending: true });
          break;
        case 'a-z':
          // Orders by company name, falling back to email if company is null
          query = query.order('company_name', { ascending: true, nullsFirst: false }).order('email', { ascending: true });
          break;
        case 'z-a':
          query = query.order('company_name', { ascending: false, nullsFirst: false }).order('email', { ascending: false });
          break;
      }

      // Apply Server-Side Pagination (Only fetches exactly 10 rows over the network)
      const from = (currentPage - 1) * itemsPerPage;
      const to = from + itemsPerPage - 1;
      query = query.range(from, to);

      // Execute network request
      const { data, count, error: dbError } = await query;

      if (dbError) throw dbError;

      setPaginatedUsers((data as FullUserProfile[]) || []);
      setTotalItems(count || 0);

    } catch (err: any) {
      console.error("Directory Fetch Error:", err);
      setError("Failed to load identity directory. Please ensure you have secure connectivity.");
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, roleFilter, sortBy, currentPage]);

  // Execute fetch when dependencies change
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  return {
    paginatedUsers, 
    loading, 
    error,
    totalItems,
    searchTerm, setSearchTerm, 
    roleFilter, setRoleFilter,
    sortBy, setSortBy, 
    currentPage, setCurrentPage, 
    totalPages, 
    itemsPerPage,
    fetchUsers // Exported so the UI can force a refresh after banning a user
  };
};