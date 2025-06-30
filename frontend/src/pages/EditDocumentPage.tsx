import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { ArrowLeft, Save, Eye, Lock, Globe, Check } from 'lucide-react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import toast from 'react-hot-toast';
import { documentService } from '../services/api';
import { useAuthStore } from '../store/authStore';

interface EditDocumentFormData {
  title: string;
  isPublic: boolean;
}

const EditDocumentPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublic, setIsPublic] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors }
  } = useForm<EditDocumentFormData>();

  useEffect(() => {
    if (id) {
      fetchDocument();
    }
  }, [id]);

  // Auto-save functionality
  useEffect(() => {
    if (hasUnsavedChanges && content.trim()) {
      const timeoutId = setTimeout(() => {
        autoSave();
      }, 3000); // Auto-save after 3 seconds of inactivity

      return () => clearTimeout(timeoutId);
    }
  }, [content, hasUnsavedChanges]);

  const fetchDocument = async () => {
    try {
      setIsLoading(true);
      const response = await documentService.getDocument(id!);
      const doc = response.data.data;
      
      setValue('title', doc.title);
      setContent(doc.content);
      setIsPublic(doc.is_public);
      setLastSaved(new Date(doc.updated_at));
    } catch (error: any) {
      if (error.response?.status === 404) {
        toast.error('Document not found');
        navigate('/dashboard');
      } else if (error.response?.status === 403) {
        toast.error('You do not have permission to edit this document');
        navigate('/dashboard');
      } else {
        toast.error('Failed to load document');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const autoSave = async () => {
    if (!content.trim()) return;
    
    try {
      setIsSaving(true);
      await documentService.updateDocument(id!, {
        content,
        isPublic
      });
      setLastSaved(new Date());
      setHasUnsavedChanges(false);
      toast.success('Document auto-saved');
    } catch (error: any) {
      toast.error('Auto-save failed');
    } finally {
      setIsSaving(false);
    }
  };

  const onSubmit = async (data: EditDocumentFormData) => {
    if (!content.trim()) {
      toast.error('Document content is required');
      return;
    }

    setIsLoading(true);
    try {
      await documentService.updateDocument(id!, {
        title: data.title,
        content,
        isPublic
      });
      
      toast.success('Document updated successfully!');
      navigate(`/documents/${id}`);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to update document');
    } finally {
      setIsLoading(false);
    }
  };

  const handleContentChange = (newContent: string) => {
    setContent(newContent);
    setHasUnsavedChanges(true);
  };

  const quillModules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'align': [] }],
      ['link', 'image'],
      ['clean']
    ],
  };

  const quillFormats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'list', 'bullet',
    'color', 'background',
    'align',
    'link', 'image'
  ];

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

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(`/documents/${id}`)}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Edit Document</h1>
            <p className="text-gray-600">Make changes to your document</p>
          </div>
        </div>
        
        {/* Auto-save indicator */}
        <div className="flex items-center gap-2 text-sm">
          {isSaving && (
            <div className="flex items-center gap-1 text-blue-600">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <span>Saving...</span>
            </div>
          )}
          {lastSaved && !isSaving && (
            <div className="flex items-center gap-1 text-green-600">
              <Check className="h-4 w-4" />
              <span>Saved {lastSaved.toLocaleTimeString()}</span>
            </div>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Document Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
            Document Title
          </label>
          <input
            id="title"
            type="text"
            {...register('title', {
              required: 'Title is required',
              minLength: {
                value: 3,
                message: 'Title must be at least 3 characters'
              }
            })}
            className={`w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
              errors.title ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="Enter document title"
          />
          {errors.title && (
            <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
          )}
        </div>

        {/* Visibility Settings */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Document Visibility
          </label>
          <div className="flex gap-4">
            <label className="flex items-center">
              <input
                type="radio"
                checked={!isPublic}
                onChange={() => setIsPublic(false)}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
              />
              <span className="ml-2 flex items-center text-sm text-gray-700">
                <Lock className="h-4 w-4 mr-1" />
                Private
              </span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                checked={isPublic}
                onChange={() => setIsPublic(true)}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
              />
              <span className="ml-2 flex items-center text-sm text-gray-700">
                <Globe className="h-4 w-4 mr-1" />
                Public
              </span>
            </label>
          </div>
          <p className="mt-1 text-sm text-gray-500">
            {isPublic 
              ? 'Anyone with the link can view this document'
              : 'Only you and users you share with can view this document'
            }
          </p>
        </div>

        {/* Content Editor */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Document Content
          </label>
          <div className="border border-gray-300 rounded-md">
            <ReactQuill
              theme="snow"
              value={content}
              onChange={handleContentChange}
              modules={quillModules}
              formats={quillFormats}
              placeholder="Start writing your document..."
              style={{ height: '400px' }}
            />
          </div>
          {!content.trim() && (
            <p className="mt-1 text-sm text-red-600">Document content is required</p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={() => navigate(`/documents/${id}`)}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => navigate(`/documents/${id}`)}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors flex items-center"
            >
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </button>
            <button
              type="submit"
              disabled={isLoading || !content.trim()}
              className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              <Save className="h-4 w-4 mr-2" />
              {isLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default EditDocumentPage; 