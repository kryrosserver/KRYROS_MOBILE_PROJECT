"use client";

import { useState } from "react";
import { Plus, Search, Users, RefreshCw } from "lucide-react";

export default function AgentsPage() {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900">Agents</h1>
          <p className="text-slate-500 text-sm hidden sm:block">Manage sales agents and their performance</p>
        </div>
        <button className="btn-primary flex items-center gap-2 justify-center min-h-[44px]">
          <Plus className="h-4 w-4" />
          Add Agent
        </button>
      </div>

      {/* Search Bar */}
      <div className="admin-card p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input 
            placeholder="Search agents..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[44px]"
          />
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="lg:hidden space-y-3">
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex flex-col items-center gap-3 text-center">
            <Users className="h-12 w-12 text-slate-200" />
            <p className="text-slate-500">No agents found.</p>
            <p className="text-sm text-slate-400">Add your first agent to get started!</p>
            <button className="btn-primary flex items-center gap-2 mt-2 min-h-[44px]">
              <Plus className="h-4 w-4" />
              Add Agent
            </button>
          </div>
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden lg:block bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <table className="w-full text-left min-w-[600px]">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 md:px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Agent Name</th>
                <th className="px-4 md:px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Email</th>
                <th className="px-4 md:px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden sm:table-cell">Performance</th>
                <th className="px-4 md:px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-4 md:px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              <tr>
                <td colSpan={5} className="px-4 md:px-6 py-20 text-center text-slate-500">
                  <div className="flex flex-col items-center gap-2">
                    <Users className="h-12 w-12 text-slate-200" />
                    <p>No agents found.</p>
                    <p className="text-sm text-slate-400">Add your first agent!</p>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
