import React, { useState, useCallback, useMemo, useEffect } from 'react';
import ReactQuill, { Quill } from 'react-quill';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { ArrowLeft, Save, Eye, Lock, Globe, Users } from 'lucide-react';
// CreateDocumentPage.tsx
// Page for creating a new document with WYSIWYG editor, mentions, and visibility controls.

import 'react-quill/dist/quill.snow.css';
import 'quill-mention/dist/quill.mention.css';
// @ts-ignore
import Mention from 'quill-mention';
import toast from 'react-hot-toast';
import { debounce } from 'lodash';

// Services
import { userService, documentService } from '../services/api';

// Styles
import '../styles/quill-mention.css';

// Types
interface CreateDocumentFormData {
  title: string;
  isPublic: boolean;
}

// Register mention module ONCE
if (typeof window !== 'undefined' && Quill) {
  Quill.register('modules/mention', Mention);
}

// Constants
const QUILL_MODULES = {
  toolbar: [
    [{ 'header': [1, 2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
    [{ 'color': [] }, { 'background': [] }],
    [{ 'align': [] }],
    ['link', 'image'],
    ['clean']
  ],
  mention: {
    allowedChars: /^[A-Za-z\sÅÄÖåäö]*$/,
    mentionDenotationChars: ["@"],
    dataAttributes: ['id', 'value', 'denotationChar', 'link', 'target'],
    source: (searchTerm: string, renderList: Function) => {},
    renderLoading: () => '<div class="loading">Loading...</div>',
    minChars: 2,
    blotName: 'mention',
    fixMentionsToQuill: true
  },
  clipboard: {
    matchVisual: false
  }
};

const QUILL_FORMATS = [
  'header',
  'bold', 'italic', 'underline', 'strike',
  'list', 'bullet',
  'color', 'background',
  'align',
  'link', 'image',
  'mention'
];

const CreateDocumentPage: React.FC = () => {
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isPublic, setIsPublic] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [hasChanges, setHasChanges] = useState(false);
  const navigate = useNavigate();

  const { register, handleSubmit, watch, formState: { errors } } = useForm<CreateDocumentFormData>({
    mode: 'onChange'
  });

  const title = watch('title');

  // Calculate word count when content changes
  useEffect(() => {
    const cleanText = content.replace(/<[^>]*>/g, ' ');
    const words = cleanText.trim().split(/\s+/).filter(word => word.length > 0);
    setWordCount(words.length);
  }, [content]);

  // Debounced user search for mentions
  const debouncedSearch = useMemo(
    () => debounce(async (searchTerm: string, renderList: Function) => {
      try {
        const response = await userService.searchUsers(searchTerm);
        const users = response.data?.data || [];
        const mapped = users.map((user: any) => ({
          id: user.id,
          value: user.name,
          denotationChar: "@",
          link: `/users/${user.id}`,
          target: "_blank"
        }));
        renderList(mapped, searchTerm);
      } catch (error) {
        renderList([], searchTerm);
      }
    }, 300),
    []
  );

  // Configure Quill modules with the debounced search
  const quillModules = useMemo(() => ({
    ...QUILL_MODULES,
    mention: {
      ...QUILL_MODULES.mention,
      source: debouncedSearch
    }
  }), [debouncedSearch]);

  const handleContentChange = (value: string) => {
    setContent(value);
    setHasChanges(true);
  };

  const onSubmit = async (data: CreateDocumentFormData) => {
    if (!content.trim()) {
      toast.error('Document content is required');
      return;
    }

    setIsLoading(true);
    const toastId = toast.loading('Creating document...');

    try {
      // Skipping sanitization due to missing dependency
      const response = await documentService.createDocument({
        title: data.title,
        content,
        isPublic
      });

      if (response?.status === 201 && response?.data?.success) {
        const docId = response?.data?.data?.id;
        if (docId) {
          toast.success('Document created successfully!', { id: toastId });
          navigate(`/documents/${docId}`);
          return;
        }
      }

      throw new Error(response?.data?.error || 'Failed to create document');
    } catch (error: any) {
      console.error('Document creation error:', error);
      toast.error(
        error.message || 'An error occurred while creating the document',
        { id: toastId }
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Back to dashboard"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Create New Document</h1>
            <p className="text-gray-600">
              {title ? `${title} • ${wordCount} words` : 'Start building your knowledge base'}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Document Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
            Document Title <span className="text-red-500">*</span>
          </label>
          <input
            id="title"
            type="text"
            {...register('title', {
              required: 'Title is required',
              minLength: {
                value: 3,
                message: 'Title must be at least 3 characters'
              },
              maxLength: {
                value: 100,
                message: 'Title must be less than 100 characters'
              }
            })}
            className={`w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
              errors.title ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="Enter document title"
            aria-invalid={errors.title ? "true" : "false"}
          />
          {errors.title && (
            <p className="mt-1 text-sm text-red-600" role="alert">{errors.title.message}</p>
          )}
        </div>

        {/* Visibility Settings */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Document Visibility
          </label>
          <div className="flex flex-wrap gap-4">
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
            <button
              type="button"
              className="flex items-center text-sm text-indigo-600 hover:text-indigo-800"
              onClick={() => toast('Share settings will be available after creation')}
            >
              <Users className="h-4 w-4 mr-1" />
              Share Settings
            </button>
          </div>
          <p className="mt-2 text-sm text-gray-500">
            {isPublic 
              ? 'Anyone with the link can view this document'
              : 'Only you and users you share with can view this document'
            }
          </p>
        </div>

        {/* Content Editor */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Document Content <span className="text-red-500">*</span>
          </label>
          <div className="border border-gray-300 rounded-md">
            <ReactQuill
              theme="snow"
              value={content}
              onChange={handleContentChange}
              modules={quillModules}
              formats={QUILL_FORMATS}
              placeholder="Start writing your document..."
              style={{ height: '500px' }}
              aria-label="Document content editor"
            />
          </div>
          {!content.trim() && (
            <p className="mt-1 text-sm text-red-600" role="alert">Document content is required</p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            disabled={isLoading}
          >
            Cancel
          </button>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors flex items-center"
              onClick={() => toast('Preview will be available after creation')}
              disabled={isLoading}
            >
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </button>
            <button
              type="submit"
              disabled={isLoading || !content.trim()}
              className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
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