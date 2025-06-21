'use client'

import { useState } from 'react'
import { FaTimes, FaImage } from 'react-icons/fa'

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPostCreated: () => void;
}

export default function CreatePostModal({ isOpen, onClose, onPostCreated }: CreatePostModalProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [author, setAuthor] = useState('')
  const [image, setImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImage(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (isSubmitting) return
    
    setIsSubmitting(true)
    
    try {
      const formData = new FormData()
      formData.append('title', title)
      formData.append('description', description)
      formData.append('author', author)
      formData.append('hasImage', image ? 'true' : 'false')
      
      if (image) {
        formData.append('image', image)
      }

      const response = await fetch('/api/no-login/posts', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        // Reset form
        setTitle('')
        setDescription('')
        setAuthor('')
        setImage(null)
        setImagePreview(null)
        onClose()
        onPostCreated() // Refresh the posts list
      } else {
        console.error('Failed to create post')
      }
    } catch (error) {
      console.error('Error creating post:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setTitle('')
    setDescription('')
    setAuthor('')
    setImage(null)
    setImagePreview(null)
    onClose()
  }

  if (!isOpen) return null
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#FFF1CA] rounded-xl shadow-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-black">Create New Post</h2>
          <button
            onClick={handleClose}
            className="text-black/60 hover:text-black transition-colors text-xl p-1"
            aria-label="Close modal"
          >
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-black mb-2">
              Title
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFB823] text-black bg-white"
              required
              placeholder="Give your post a title"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-black mb-2">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFB823] resize-none text-black bg-white"
              required
              placeholder="What does this post contain?"
            />
          </div>

          <div>
            <label htmlFor="author" className="block text-sm font-medium text-black mb-2">
              Author
            </label>
            <input
              type="text"
              id="author"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFB823] text-black bg-white"
              required
              placeholder="Who wrote this post?"
            />
          </div>

          <div>
            <label htmlFor="image" className="block text-sm font-medium text-black mb-2">
              Image (optional)
            </label>
            <div className="flex items-center space-x-3">
              <label className="flex items-center px-4 py-2 bg-[#FFB823] text-black rounded-lg cursor-pointer hover:bg-[#ffad00] transition-colors font-medium">
                <FaImage className="mr-2" />
                Choose Image
                <input
                  type="file"
                  id="image"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
              {image && (
                <span className="text-sm text-black/70 truncate max-w-[200px]">{image.name}</span>
              )}
            </div>
            {imagePreview && (
              <div className="mt-3">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-32 object-cover rounded-lg border border-gray-200"
                />
              </div>
            )}
          </div>

          <div className="flex space-x-3 pt-6">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-3 border border-gray-300 text-black rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`flex-1 px-4 py-3 bg-[#FFB823] text-black rounded-lg hover:bg-[#ffad00] transition-colors font-medium ${
                isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isSubmitting ? 'Creating...' : 'Create Post'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}