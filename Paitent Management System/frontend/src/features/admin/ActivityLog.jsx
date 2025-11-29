import React, { useEffect, useState, useMemo } from 'react';
import { FileText, Search, Filter, ChevronLeft, ChevronRight, Eye, User, Users, Calendar, MessageCircle, Bot, Activity, Pill, Stethoscope, Table, Clock, Shield, UserCog, Hospital } from 'lucide-react';
import Card from '@/components/Card.jsx';

const ActivityLog = () => {
  const laravelUrl = useMemo(() => (import.meta.env.VITE_LARAVEL_URL || 'http://localhost:8000').replace(/\/$/, ''), []);
  
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    action: '',
    model_type: '',
    search: '',
  });
  const [selectedLog, setSelectedLog] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'timeline'

  const fetchLogs = async (page = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        per_page: '20',
        ...Object.fromEntries(Object.entries(filters).filter(([_, v]) => v !== '')),
      });

      const res = await fetch(`${laravelUrl}/api/admin/activity-logs?${params}`, {
        credentials: 'include',
        headers: { Accept: 'application/json' },
      });

      if (res.ok) {
        const data = await res.json();
        setLogs(data.data || []);
        setCurrentPage(data.current_page || 1);
        setTotalPages(data.last_page || 1);
      }
    } catch (error) {
      console.error('Error fetching activity logs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(currentPage);
  }, [currentPage]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const applyFilters = () => {
    setCurrentPage(1);
    fetchLogs(1);
  };

  const clearFilters = () => {
    setFilters({ action: '', model_type: '', search: '' });
    setCurrentPage(1);
    setTimeout(() => fetchLogs(1), 0);
  };

  const getActionBadge = (action) => {
    const colors = {
      created: 'bg-green-100 text-green-700',
      updated: 'bg-blue-100 text-blue-700',
      deleted: 'bg-red-100 text-red-700',
      login: 'bg-purple-100 text-purple-700',
      logout: 'bg-gray-100 text-gray-700',
      viewed: 'bg-cyan-100 text-cyan-700',
    };
    return colors[action] || 'bg-gray-100 text-gray-700';
  };

  const getRoleBadge = (role) => {
    const colors = {
      admin: 'bg-red-100 text-red-700',
      doctor: 'bg-blue-100 text-blue-700',
      patient: 'bg-green-100 text-green-700',
    };
    return colors[role] || 'bg-gray-100 text-gray-700';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getModelIcon = (modelType) => {
    const icons = {
      User: <User size={16} />,
      Patient: <Users size={16} />,
      Appointment: <Calendar size={16} />,
      Message: <MessageCircle size={16} />,
      Chatbot: <Bot size={16} />,
      TherapyEffectiveness: <Activity size={16} />,
      TreatmentRecommendation: <Pill size={16} />,
      TreatmentChatbot: <Stethoscope size={16} />,
    };
    return icons[modelType] || <FileText size={16} />;
  };

  const getModelBadge = (modelType) => {
    const badges = {
      User: 'bg-red-100 text-red-700 border-red-200',
      Patient: 'bg-blue-100 text-blue-700 border-blue-200',
      Appointment: 'bg-amber-100 text-amber-700 border-amber-200',
      Message: 'bg-purple-100 text-purple-700 border-purple-200',
      Chatbot: 'bg-cyan-100 text-cyan-700 border-cyan-200',
      TherapyEffectiveness: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      TreatmentRecommendation: 'bg-green-100 text-green-700 border-green-200',
      TreatmentChatbot: 'bg-teal-100 text-teal-700 border-teal-200',
    };
    return badges[modelType] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  const getCategoryForModel = (modelType) => {
    if (modelType === 'User') return 'auth';
    if (modelType === 'Patient') return 'admin';
    if (modelType === 'Appointment' || modelType === 'Message') return 'clinical';
    if (['Chatbot', 'TherapyEffectiveness', 'TreatmentRecommendation', 'TreatmentChatbot'].includes(modelType)) return 'ml';
    return 'all';
  };

  const filteredLogsByTab = useMemo(() => {
    if (activeTab === 'all') return logs;
    return logs.filter(log => getCategoryForModel(log.model_type) === activeTab);
  }, [logs, activeTab]);

  const viewDetails = async (logId) => {
    try {
      const res = await fetch(`${laravelUrl}/api/admin/activity-logs/${logId}`, {
        credentials: 'include',
        headers: { Accept: 'application/json' },
      });
      if (res.ok) {
        const data = await res.json();
        setSelectedLog(data);
        setShowDetailModal(true);
      }
    } catch (error) {
      console.error('Error fetching log details:', error);
    }
  };

  return (
    <div className="w-full px-6 md:px-10 lg:px-14 py-10 space-y-6">
      {/* Header */}
      <Card className="border-0 rounded-3xl bg-gradient-to-br from-emerald-50 via-white to-cyan-50 ring-1 ring-emerald-100/60 shadow-xl px-6 sm:px-8 py-8">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
            <FileText size={24} />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-emerald-400">Admin Console</p>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Activity Logs</h1>
            <p className="text-xs text-emerald-400 mt-1">Track all system activities and user actions</p>
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 rounded-lg font-medium transition flex items-center gap-2 ${
                activeTab === 'all'
                  ? 'bg-emerald-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <FileText size={18} />
              All Logs
            </button>
            <button
              onClick={() => setActiveTab('auth')}
              className={`px-4 py-2 rounded-lg font-medium transition flex items-center gap-2 ${
                activeTab === 'auth'
                  ? 'bg-purple-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Shield size={18} />
              Authentication
            </button>
            <button
              onClick={() => setActiveTab('admin')}
              className={`px-4 py-2 rounded-lg font-medium transition flex items-center gap-2 ${
                activeTab === 'admin'
                  ? 'bg-red-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <UserCog size={18} />
              Admin Actions
            </button>
            <button
              onClick={() => setActiveTab('clinical')}
              className={`px-4 py-2 rounded-lg font-medium transition flex items-center gap-2 ${
                activeTab === 'clinical'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Hospital size={18} />
              Clinical
            </button>
            <button
              onClick={() => setActiveTab('ml')}
              className={`px-4 py-2 rounded-lg font-medium transition flex items-center gap-2 ${
                activeTab === 'ml'
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Activity size={18} />
              ML/AI Features
            </button>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('table')}
              className={`px-4 py-2 rounded-lg font-medium transition flex items-center gap-2 ${
                viewMode === 'table'
                  ? 'bg-emerald-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Table size={18} />
              Table
            </button>
            <button
              onClick={() => setViewMode('timeline')}
              className={`px-4 py-2 rounded-lg font-medium transition flex items-center gap-2 ${
                viewMode === 'timeline'
                  ? 'bg-emerald-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Clock size={18} />
              Timeline
            </button>
          </div>
        </div>
      </Card>

      {/* Filters */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search description..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Action</label>
            <select
              value={filters.action}
              onChange={(e) => handleFilterChange('action', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="">All Actions</option>
              <option value="created">Created</option>
              <option value="updated">Updated</option>
              <option value="deleted">Deleted</option>
              <option value="login">Login</option>
              <option value="logout">Logout</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Model Type</label>
            <select
              value={filters.model_type}
              onChange={(e) => handleFilterChange('model_type', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="">All Types</option>
              <option value="User">User</option>
              <option value="Patient">Patient</option>
              <option value="Appointment">Appointment</option>
              <option value="Message">Message</option>
              <option value="Chatbot">Chatbot</option>
              <option value="TherapyEffectiveness">Therapy Effectiveness</option>
              <option value="TreatmentRecommendation">Treatment Recommendation</option>
              <option value="TreatmentChatbot">Treatment Chatbot</option>
            </select>
          </div>

          <div className="flex items-end gap-2">
            <button
              onClick={applyFilters}
              className="flex-1 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition flex items-center justify-center gap-2"
            >
              <Filter size={18} />
              Apply
            </button>
            <button
              onClick={clearFilters}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
            >
              Clear
            </button>
          </div>
        </div>
      </Card>

      {/* Activity Table or Timeline */}
      <Card className="p-6">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
            <p className="mt-2 text-gray-500">Loading activity logs...</p>
          </div>
        ) : filteredLogsByTab.length === 0 ? (
          <div className="text-center py-12">
            <FileText size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">No activity logs found</p>
          </div>
        ) : viewMode === 'table' ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Timestamp</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">User</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Action</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Description</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Model</th>
                    <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Details</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLogsByTab.map((log) => (
                    <tr key={log.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {formatDate(log.created_at)}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-gray-900">{log.user_name}</span>
                          <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium w-fit ${getRoleBadge(log.user_role)}`}>
                            {log.user_role}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getActionBadge(log.action)}`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-700 max-w-md truncate">
                        {log.description}
                      </td>
                      <td className="py-3 px-4">
                        {log.model_type && (
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border ${getModelBadge(log.model_type)}`}>
                            {getModelIcon(log.model_type)}
                            {log.model_type}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => viewDetails(log.id)}
                          className="inline-flex items-center gap-1 px-3 py-1 text-sm text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded transition"
                        >
                          <Eye size={16} />
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <>
            {/* Timeline View */}
            <div className="space-y-4">
              {filteredLogsByTab.map((log, index) => (
                <div key={log.id} className="relative pl-8 pb-8 border-l-2 border-gray-200 last:border-0 last:pb-0">
                  {/* Timeline dot */}
                  <div className={`absolute left-[-9px] top-0 w-4 h-4 rounded-full border-2 border-white ${
                    log.action === 'created' ? 'bg-green-500' :
                    log.action === 'updated' ? 'bg-blue-500' :
                    log.action === 'deleted' ? 'bg-red-500' :
                    log.action === 'login' ? 'bg-purple-500' :
                    log.action === 'logout' ? 'bg-gray-500' :
                    'bg-cyan-500'
                  }`}></div>
                  
                  {/* Timeline content */}
                  <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border ${getModelBadge(log.model_type)}`}>
                          {getModelIcon(log.model_type)}
                          {log.model_type}
                        </span>
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getActionBadge(log.action)}`}>
                          {log.action}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500">{formatDate(log.created_at)}</span>
                    </div>
                    
                    <p className="text-sm text-gray-700 mb-3">{log.description}</p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">by</span>
                        <span className="text-xs font-medium text-gray-900">{log.user_name}</span>
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${getRoleBadge(log.user_role)}`}>
                          {log.user_role}
                        </span>
                      </div>
                      <button
                        onClick={() => viewDetails(log.id)}
                        className="inline-flex items-center gap-1 px-3 py-1 text-xs text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded transition"
                      >
                        <Eye size={14} />
                        Details
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <ChevronLeft size={18} />
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  Next
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          </>
        )}
      </Card>

      {/* Detail Modal */}
      {showDetailModal && selectedLog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-semibold text-gray-900">Activity Details</h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Timestamp</label>
                <p className="text-gray-900">{formatDate(selectedLog.created_at)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">User</label>
                <p className="text-gray-900">{selectedLog.user_name} ({selectedLog.user_role})</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Action</label>
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getActionBadge(selectedLog.action)}`}>
                  {selectedLog.action}
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Description</label>
                <p className="text-gray-900">{selectedLog.description}</p>
              </div>
              {selectedLog.model_type && (
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Model Type</label>
                  <p className="text-gray-900">{selectedLog.model_type} (ID: {selectedLog.model_id})</p>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">IP Address</label>
                <p className="text-gray-900">{selectedLog.ip_address || 'N/A'}</p>
              </div>
              {selectedLog.changes && (
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Changes</label>
                  <pre className="bg-gray-50 p-4 rounded-lg text-sm overflow-x-auto">
                    {JSON.stringify(selectedLog.changes, null, 2)}
                  </pre>
                </div>
              )}
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setShowDetailModal(false)}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActivityLog;
