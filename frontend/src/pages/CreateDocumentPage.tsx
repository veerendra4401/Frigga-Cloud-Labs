import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { ArrowLeft, Save, Eye, Lock, Globe } from 'lucide-react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import toast from 'react-hot-toast';
import { documentService } from '../services/api';

interface CreateDocumentFormData {
  title: string;
  isPublic: boolean;
}

const CreateDocumentPage: React.FC = () => {
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isPublic, setIsPublic] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<CreateDocumentFormData>();

  const onSubmit = async (data: CreateDocumentFormData) => {
    if (!content.trim()) {
      toast.error('Document content is required', { id: 'content-required' });
      return;
    }

    setIsLoading(true);
    const toastId = 'create-document';
    try {
      const response = await documentService.createDocument({
        title: data.title,
        content,
        isPublic
      });

      console.log('Create document response:', {
        status: response?.status,
        data: response?.data,
        success: response?.data?.success
      });

      // Only show success toast and navigate if status is 201 and success is true
      if (response?.status === 201 && response?.data?.success) {
        const docId = response?.data?.data?.id;
        if (docId) {
          toast.success('Document created successfully!', { id: toastId });
          setTimeout(() => {
            navigate(`/documents/${docId}`);
          }, 200); // Give the toast a moment to show
        } else {
          toast.error('Document created but no ID returned!', { id: toastId + '-noid' });
        }
        return;
      }

      // If not success, show error
      const errorMessage = response?.data?.error || response?.data?.message || 'Failed to create document';
      toast.error(errorMessage, { id: toastId });
    } catch (error: any) {
      // Check if this is a server response with an error message
      const errorMessage = error?.response?.data?.error || error?.response?.data?.message;
      if (errorMessage) {
        toast.error(errorMessage, { id: toastId });
      } else {
        // For network errors or other issues
        toast.error('Failed to create document', { id: toastId });
      }
    } finally {
      setIsLoading(false);
    }
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
            <h1 className="text-2xl font-bold text-gray-900">Create New Document</h1>
            <p className="text-gray-600">Start building your knowledge base</p>
          </div>
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
              onChange={setContent}
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
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Create Document
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreateDocumentPage; 