import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Edit, 
  Share, 
  Users, 
  Lock, 
  Globe, 
  Clock, 
  User,
  History,
  MoreVertical
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';
import { documentService } from '../services/api';
import { useAuthStore } from '../store/authStore';

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
  author?: {
    id: number;
    name: string;
    email: string;
  };
  shares?: Array<{
    id: number;
    permission: string;
    created_at: string;
    user_id: number;
    user_name: string;
    user_email: string;
  }>;
  mentions?: Array<{
    id: number;
    created_at: string;
    user_id: number;
    user_name: string;
    user_email: string;
    mentioned_by_id: number;
    mentioned_by_name: string;
  }>;
}

const DocumentPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [document, setDocument] = useState<Document | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showShareModal, setShowShareModal] = useState(false);

  useEffect(() => {
    if (id) {
      console.log('Attempting to fetch document with ID:', id, 'Type:', typeof id);
      fetchDocument();
    }
  }, [id]);

  const fetchDocument = async () => {
    try {
      setIsLoading(true);
      console.log('Making API request for document ID:', id);
      const response = await documentService.getDocument(id!);
      console.log('Document API response:', response.data);
      setDocument(response.data.data);
    } catch (error: any) {
      console.error('Error fetching document:', error);
      console.error('Error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });
      
      if (error.response?.status === 404) {
        toast.error('Document not found');
        navigate('/dashboard');
      } else if (error.response?.status === 403) {
        toast.error('You do not have permission to view this document');
        navigate('/dashboard');
      } else {
        toast.error('Failed to load document');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const canEdit = user && document && (parseInt(user.id) === document.author_id || user.role === 'ADMIN');

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!document) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Document not found</h2>
          <p className="text-gray-600 mb-6">The document you're looking for doesn't exist or has been removed.</p>
          <Link
            to="/dashboard"
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <h1 className="text-3xl font-bold text-gray-900">{document.title}</h1>
              {document.is_public ? (
                <Globe className="h-5 w-5 text-green-600" />
              ) : (
                <Lock className="h-5 w-5 text-gray-600" />
              )}
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <User className="h-4 w-4" />
                <span>By {document.author_name}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>
                  Updated {formatDistanceToNow(new Date(document.updated_at), { addSuffix: true })}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {canEdit && (
            <Link
              to={`/documents/${document.id}/edit`}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors flex items-center"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Link>
          )}
          <button
            onClick={() => setShowShareModal(true)}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors flex items-center"
          >
            <Share className="h-4 w-4 mr-2" />
            Share
          </button>
        </div>
      </div>

      {/* Document Content */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
        <div 
          className="prose max-w-none"
          dangerouslySetInnerHTML={{ __html: document.content }}
        />
      </div>

      {/* Document Info */}
      <div className="grid md:grid-cols-2 gap-8">
        {/* Sharing Information */}
        {document.shares && document.shares.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Shared with
            </h3>
            <div className="space-y-3">
              {document.shares.map((share) => (
                <div key={share.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{share.user_name}</p>
                    <p className="text-sm text-gray-600">{share.user_email}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    share.permission === 'EDIT' 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {share.permission}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Mentions */}
        {document.mentions && document.mentions.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <User className="h-5 w-5 mr-2" />
              Mentions
            </h3>
            <div className="space-y-3">
              {document.mentions.map((mention) => (
                <div key={mention.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{mention.user_name}</p>
                    <p className="text-sm text-gray-600">Mentioned by {mention.mentioned_by_name}</p>
                  </div>
                  <span className="text-xs text-gray-500">
                    {formatDistanceToNow(new Date(mention.created_at), { addSuffix: true })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Share Document</h3>
            <p className="text-gray-600 mb-4">
              This feature allows you to share this document with other users. 
              Implementation coming soon!
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowShareModal(false)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
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

export default DocumentPage; 