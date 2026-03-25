"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Search, X, Clock, Trash2, ChevronRight } from "lucide-react";
import { categoriesApi } from "@/lib/api";

interface MobileSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Category {
  id: string;
  name: string;
  isActive: boolean;
}

export function MobileSearchModal({ isOpen, onClose }: MobileSearchModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await categoriesApi.getAll();
        if (response.data) {
          const activeCategories = Array.isArray(response.data)
            ? response.data.filter((c: any) => c.isActive !== false)
            : [];
          setCategories(activeCategories);
        }
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      }
    };

    if (isOpen) {
      fetchCategories();
      // Load recent searches from localStorage
      const saved = localStorage.getItem("recentSearches");
      if (saved) {
        setRecentSearches(JSON.parse(saved).slice(0, 5));
      }
    }
  }, [isOpen]);

  // Save search to recent searches
  const saveSearch = useCallback((query: string) => {
    if (query.trim()) {
      const updated = [
        query,
        ...recentSearches.filter((s) => s !== query),
      ].slice(0, 5);
      setRecentSearches(updated);
      localStorage.setItem("recentSearches", JSON.stringify(updated));
    }
  }, [recentSearches]);

  // Handle search submission
  const handleSearch = (query: string) => {
    if (query.trim()) {
      saveSearch(query);
      const params = new URLSearchParams();
      params.set("q", query);
      if (selectedCategory) {
        params.set("category", selectedCategory);
      }
      window.location.href = `/shop?${params.toString()}`;
    }
  };

  // Handle category click
  const handleCategoryClick = (categoryId: string) => {
    window.location.href = `/shop?category=${categoryId}`;
  };

  // Handle recent search click
  const handleRecentSearchClick = (query: string) => {
    handleSearch(query);
  };

  // Clear recent searches
  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem("recentSearches");
  };

  // Clear button handler
  const handleClear = () => {
    setSearchQuery("");
    setSelectedCategory(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch(searchQuery);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] bg-black/50 lg:hidden"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="absolute bottom-0 left-0 right-0 max-h-[90vh] w-full bg-white rounded-t-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="shrink-0 border-b border-slate-100 bg-white p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-slate-900">Search Products</h2>
                <button
                  onClick={onClose}
                  className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                  aria-label="Close search"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Search Input */}
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search for products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  autoFocus
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 py-3 pl-10 pr-10 text-sm text-slate-900 placeholder:text-slate-400 focus:border-kryros-green focus:bg-white focus:outline-none focus:ring-2 focus:ring-kryros-green/20"
                />
                {searchQuery && (
                  <button
                    onClick={handleClear}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                    aria-label="Clear search"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              {/* Search Button */}
              <button
                onClick={() => handleSearch(searchQuery)}
                className="w-full rounded-lg bg-kryros-green text-white py-2.5 font-semibold text-sm hover:bg-kryros-green/90 transition-colors"
              >
                Search
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {searchQuery.length === 0 ? (
                <div className="flex flex-col space-y-6 p-4">
                  {/* Recent Searches */}
                  {recentSearches.length > 0 && (
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900">
                          <Clock className="h-4 w-4 text-slate-400" />
                          Recent Searches
                        </h3>
                        <button
                          onClick={clearRecentSearches}
                          className="flex items-center gap-1 text-xs font-medium text-slate-400 hover:text-slate-600 transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Clear
                        </button>
                      </div>
                      <div className="space-y-2">
                        {recentSearches.map((search) => (
                          <motion.button
                            key={search}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            onClick={() => handleRecentSearchClick(search)}
                            className="w-full flex items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50 transition-colors group"
                          >
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-slate-300 group-hover:text-slate-400" />
                              <span>{search}</span>
                            </div>
                            <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-slate-400" />
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Categories */}
                  <div>
                    <h3 className="mb-3 text-sm font-bold text-slate-900">Browse Categories</h3>
                    <div className="space-y-2">
                      {categories.length > 0 ? (
                        categories.map((category) => (
                          <motion.button
                            key={category.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            onClick={() => handleCategoryClick(category.id)}
                            className="w-full flex items-center justify-between rounded-lg px-3 py-3 text-left text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors group border border-slate-100 hover:border-kryros-green"
                          >
                            <span>{category.name}</span>
                            <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-kryros-green transition-colors" />
                          </motion.button>
                        ))
                      ) : (
                        <p className="py-4 text-center text-sm text-slate-400">
                          Loading categories...
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                /* Search Results / Filtered Categories */
                <div className="p-4 space-y-4">
                  <div>
                    <h3 className="mb-3 text-sm font-bold text-slate-900">
                      Refine by Category
                    </h3>
                    <div className="space-y-2">
                      <button
                        onClick={() => setSelectedCategory(null)}
                        className={`w-full flex items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors ${
                          selectedCategory === null
                            ? "bg-kryros-green/10 text-kryros-green border border-kryros-green"
                            : "text-slate-700 bg-slate-50 border border-slate-100 hover:bg-slate-100"
                        }`}
                      >
                        <span>All Categories</span>
                        {selectedCategory === null && (
                          <div className="h-2 w-2 rounded-full bg-kryros-green" />
                        )}
                      </button>
                      {categories.map((category) => (
                        <button
                          key={category.id}
                          onClick={() => setSelectedCategory(category.id)}
                          className={`w-full flex items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors ${
                            selectedCategory === category.id
                              ? "bg-kryros-green/10 text-kryros-green border border-kryros-green"
                              : "text-slate-700 bg-slate-50 border border-slate-100 hover:bg-slate-100"
                          }`}
                        >
                          <span>{category.name}</span>
                          {selectedCategory === category.id && (
                            <div className="h-2 w-2 rounded-full bg-kryros-green" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Smart Suggestion */}
                  <div className="bg-kryros-green/5 border border-kryros-green/20 rounded-lg p-3">
                    <p className="text-xs text-slate-600 mb-2 font-medium">Searching for:</p>
                    <div className="flex flex-wrap gap-2">
                      <span className="inline-block bg-kryros-green/10 text-kryros-green px-3 py-1.5 rounded-lg text-sm font-medium">
                        "{searchQuery}"
                      </span>
                      {selectedCategory && (
                        <span className="inline-block bg-blue-100 text-blue-700 px-3 py-1.5 rounded-lg text-sm font-medium">
                          {categories.find((c) => c.id === selectedCategory)?.name}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
