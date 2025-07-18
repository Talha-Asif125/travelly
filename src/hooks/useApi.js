import { useState, useEffect, useCallback, useRef } from 'react';
import ApiService from '../utils/ApiService';

/**
 * Custom hook for API calls with loading, error, and data state management
 * Provides consistent patterns across all components
 */

const useApi = (endpoint, options = {}) => {
  const {
    method = 'GET',
    data = null,
    dependencies = [],
    immediate = true,
    onSuccess = null,
    onError = null,
    transformData = null
  } = options;

  const [state, setState] = useState({
    data: null,
    loading: immediate,
    error: null,
    isSuccess: false
  });

  const mountedRef = useRef(true);
  const abortControllerRef = useRef(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const execute = useCallback(async (overrideData = null) => {
    if (!mountedRef.current) return;

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();

    setState(prev => ({
      ...prev,
      loading: true,
      error: null,
      isSuccess: false
    }));

    try {
      let response;
      const requestData = overrideData || data;
      const requestOptions = { 
        signal: abortControllerRef.current.signal 
      };

      switch (method.toUpperCase()) {
        case 'GET':
          response = await ApiService.get(endpoint, requestOptions);
          break;
        case 'POST':
          response = await ApiService.post(endpoint, requestData, requestOptions);
          break;
        case 'PUT':
          response = await ApiService.put(endpoint, requestData, requestOptions);
          break;
        case 'DELETE':
          response = await ApiService.delete(endpoint, requestOptions);
          break;
        case 'PATCH':
          response = await ApiService.patch(endpoint, requestData, requestOptions);
          break;
        default:
          throw new Error(`Unsupported method: ${method}`);
      }

      if (!mountedRef.current) return;

      // Transform data if transformer provided
      const finalData = transformData ? transformData(response.data) : response.data;

      setState({
        data: finalData,
        loading: false,
        error: null,
        isSuccess: true
      });

      // Call success callback
      if (onSuccess) {
        onSuccess(finalData, response);
      }

      return finalData;
    } catch (error) {
      if (!mountedRef.current) return;

      // Don't update state if request was aborted
      if (error.name === 'AbortError') return;

      const errorMessage = error.message || 'An error occurred';
      
      setState({
        data: null,
        loading: false,
        error: errorMessage,
        isSuccess: false
      });

      // Call error callback
      if (onError) {
        onError(error);
      }

      throw error;
    }
  }, [endpoint, method, data, transformData, onSuccess, onError]);

  // Auto-execute on mount or dependency change
  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [immediate, ...dependencies]);

  return {
    ...state,
    execute,
    refetch: execute
  };
};

/**
 * Hook for paginated API calls
 */
export const usePaginatedApi = (endpoint, options = {}) => {
  const {
    pageSize = 10,
    initialPage = 1,
    filters = {},
    ...apiOptions
  } = options;

  const [pagination, setPagination] = useState({
    page: initialPage,
    limit: pageSize,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false
  });

  const {
    data: response,
    loading,
    error,
    execute,
    refetch
  } = useApi(endpoint, {
    ...apiOptions,
    method: 'GET',
    immediate: false,
    transformData: (data) => {
      if (data.pagination) {
        setPagination(data.pagination);
        return data.data;
      }
      return data;
    }
  });

  const loadPage = useCallback(async (page = 1, newFilters = {}) => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: pageSize.toString(),
      ...filters,
      ...newFilters
    });

    const fullEndpoint = `${endpoint}?${params.toString()}`;
    
    try {
      return await execute();
    } catch (error) {
      console.error('Error loading page:', error);
    }
  }, [endpoint, pageSize, filters, execute]);

  const nextPage = useCallback(() => {
    if (pagination.hasNext) {
      loadPage(pagination.page + 1);
    }
  }, [pagination.hasNext, pagination.page, loadPage]);

  const prevPage = useCallback(() => {
    if (pagination.hasPrev) {
      loadPage(pagination.page - 1);
    }
  }, [pagination.hasPrev, pagination.page, loadPage]);

  const goToPage = useCallback((page) => {
    if (page >= 1 && page <= pagination.totalPages) {
      loadPage(page);
    }
  }, [pagination.totalPages, loadPage]);

  // Load initial page
  useEffect(() => {
    loadPage(initialPage);
  }, []);

  return {
    data: response,
    loading,
    error,
    pagination,
    loadPage,
    nextPage,
    prevPage,
    goToPage,
    refetch: () => loadPage(pagination.page)
  };
};

/**
 * Hook for form submissions
 */
export const useFormSubmit = (endpoint, options = {}) => {
  const {
    method = 'POST',
    onSuccess = null,
    onError = null,
    resetOnSuccess = false
  } = options;

  const [formState, setFormState] = useState({
    submitting: false,
    submitted: false,
    error: null
  });

  const { execute } = useApi(endpoint, {
    method,
    immediate: false,
    onSuccess: (data, response) => {
      setFormState({
        submitting: false,
        submitted: true,
        error: null
      });

      if (onSuccess) {
        onSuccess(data, response);
      }

      if (resetOnSuccess) {
        setTimeout(() => {
          setFormState(prev => ({ ...prev, submitted: false }));
        }, 3000);
      }
    },
    onError: (error) => {
      setFormState({
        submitting: false,
        submitted: false,
        error: error.message
      });

      if (onError) {
        onError(error);
      }
    }
  });

  const submit = useCallback(async (formData) => {
    setFormState({
      submitting: true,
      submitted: false,
      error: null
    });

    try {
      return await execute(formData);
    } catch (error) {
      // Error already handled in onError callback
      throw error;
    }
  }, [execute]);

  const reset = useCallback(() => {
    setFormState({
      submitting: false,
      submitted: false,
      error: null
    });
  }, []);

  return {
    ...formState,
    submit,
    reset
  };
};

/**
 * Hook for infinite scrolling
 */
export const useInfiniteApi = (endpoint, options = {}) => {
  const { pageSize = 10, ...apiOptions } = options;
  
  const [allData, setAllData] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

  const { data, loading, error, execute } = useApi(endpoint, {
    ...apiOptions,
    immediate: false,
    transformData: (response) => {
      const newData = response.data || response;
      const pagination = response.pagination;

      if (pagination) {
        setHasMore(pagination.hasNext);
        return newData;
      }

      // Fallback: assume no more data if less than pageSize returned
      setHasMore(newData.length === pageSize);
      return newData;
    }
  });

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;

    const params = new URLSearchParams({
      page: page.toString(),
      limit: pageSize.toString()
    });

    try {
      const result = await execute();
      if (result && result.length > 0) {
        setAllData(prev => [...prev, ...result]);
        setPage(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error loading more data:', error);
    }
  }, [page, pageSize, loading, hasMore, execute]);

  const reset = useCallback(() => {
    setAllData([]);
    setPage(1);
    setHasMore(true);
  }, []);

  // Load initial data
  useEffect(() => {
    loadMore();
  }, []);

  return {
    data: allData,
    loading,
    error,
    hasMore,
    loadMore,
    reset
  };
};

export default useApi; 