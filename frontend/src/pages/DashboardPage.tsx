import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Eye, Edit, Users, Lock, Globe, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';
import { documentService } from '../services/api';
import { formatDistanceToNow } from 'date-fns';

interface Document {
  id: number;
  title: string;
  content: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
  author_id: number;
  author_name: string;
  author_email: string;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const DashboardPage: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuthStore();

  const fetchDocuments = async (page = 1, search = '') => {
    try {
      setIsLoading(true);
      console.log('Fetching documents with params:', { page, limit: 10, search });
      const response = await documentService.getDocuments(page, 10, search);
      console.log('Documents response:', response.data);
      
      if (!response.data.data || !Array.isArray(response.data.data)) {
        console.error('Invalid response format:', response.data);
        toast.error('Received invalid data format from server');
        return;
      }
      
      // Log each document's ID and type
      response.data.data.forEach((doc: Document) => {
        console.log('Document ID:', doc.id, 'Type:', typeof doc.id);
      });
      
      setDocuments(response.data.data);
      setPagination(response.data.pagination);
      console.log('Updated state:', {
        documentsCount: response.data.data.length,
        pagination: response.data.pagination,
        documentIds: response.data.data.map((d: Document) => ({ id: d.id, type: typeof d.id }))
      });
    } catch (error: any) {
      console.error('Error fetching documents:', error);
      console.error('Error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });
      
      const errorMessage = error.response?.data?.error || 
                          error.response?.data?.message || 
                          error.message || 
                          'Failed to load documents';
      
      toast.error(errorMessage, {
        duration: 5000,
        position: 'top-right',
        style: {
          background: '#fee2e2',
          color: '#991b1b',
          border: '1px solid #f87171'
        }
      });

      // Set empty state for documents
      setDocuments([]);
      setPagination({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchDocuments(1, searchTerm);
  };

  const handlePageChange = (newPage: number) => {
    fetchDocuments(newPage, searchTerm);
  };

  const getVisibilityIcon = (isPublic: boolean) => {
    return isPublic ? (
      <span title="Public">
        <Globe className="h-4 w-4 text-green-600" />
      </span>
    ) : (
      <span title="Private">
        <Lock className="h-4 w-4 text-gray-600" />
      </span>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Welcome back, {user?.name}! Manage your knowledge base documents.
          </p>
        </div>
        {user && (
          <Link
            to="/documents/create"
            className="mt-4 sm:mt-0 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center"
          >
            <Plus className="h-5 w-5 mr-2" />
            Create Document
          </Link>
        )}
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
        <form onSubmit={handleSearch} className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search documents..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <button
            type="submit"
            className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 transition-colors"
          >
            Search
          </button>
        </form>
      </div>

      {/* Documents List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading documents...</p>
          </div>
        ) : documents.length === 0 ? (
          <div className="p-8 text-center">
            <div className="text-gray-400 mb-4">
              <Search className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? 'No documents found' : 'No documents yet'}
            </h3>
            <p className="text-gray-600 mb-4">
              {searchTerm 
                ? 'Try adjusting your search terms'
                : 'Create your first document to get started'
              }
            </p>
            {!searchTerm && user && (
              <Link
                to="/documents/create"
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors inline-flex items-center"
              >
                <Plus className="h-5 w-5 mr-2" />
                Create Document
              </Link>
            )}
          </div>
        ) : (
          <>
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">
                Documents ({pagination.total})
              </h2>
            </div>
            <div className="divide-y divide-gray-200">
              {documents.map((doc) => (
                <div key={doc.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-medium text-gray-900 truncate">
                          <Link
                            to={`/documents/${doc.id}`}
                            className="hover:text-indigo-600 transition-colors"
                          >
                            {doc.title}
                          </Link>
                        </h3>
                        {getVisibilityIcon(doc.is_public)}
                      </div>
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                        {doc.content.replace(/<[^>]*>/g, '').substring(0, 150)}...
                      </p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          <span>{doc.author_name}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>
                            Updated {formatDistanceToNow(new Date(doc.updated_at), { addSuffix: true })}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <Link
                        to={`/documents/${doc.id}`}
                        className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                        title="View document"
                      >
                        <Eye className="h-5 w-5" />
                      </Link>
                      {user?.id && Number(user.id) === doc.author_id && (
                        <Link
                          to={`/documents/${doc.id}/edit`}
                          className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                          title="Edit document"
                        >
                          <Edit className="h-5 w-5" />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                    {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                    {pagination.total} results
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page === 1}
                      className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <span className="px-3 py-1 text-sm text-gray-700">
                      Page {pagination.page} of {pagination.totalPages}
                    </span>
                    <button
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page === pagination.totalPages}
                      className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;