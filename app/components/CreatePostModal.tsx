'use client'

import { useState } from 'react'
import { FaTimes, FaImage } from 'react-icons/fa'

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreatePostModal({ isOpen, onClose }: CreatePostModalProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [author, setAuthor] = useState('')
  const [image, setImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // API req will be added here
    console.log('Creating post:', { title, description, author, image })
    
    setTitle('')
    setDescription('')
    setAuthor('')
    setImage(null)
    setImagePreview(null)
    onClose()
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#FFF1CA] rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-black">Create New Post</h2>          <button
            onClick={handleClose}
            className="text-black hover:text-gray-600 text-xl"
            aria-label="Close modal"
          >
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-black mb-1">
              Title
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-black w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FFB823]"
              required
              placeholder='give ur post a title'
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-black mb-1">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="text-black w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FFB823] resize-none"
              required
              placeholder='what the post contains'
            />
          </div>

          <div>
            <label htmlFor="author" className="block text-sm font-medium text-black mb-1">
              Author
            </label>
            <input
              type="text"
              id="author"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              className="text-black w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FFB823]"
              required
              placeholder='who wrote this post..?'
            />
          </div>

          <div>
            <label htmlFor="image" className="block text-sm font-medium text-black mb-1">
              Image (optional)
            </label>
            <div className="flex items-center space-x-2">
              <label className="flex items-center px-3 py-2 bg-[#FFB823] text-black rounded-md cursor-pointer hover:bg-[#ffad00] transition-colors">
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
                <span className="text-sm text-black">{image.name}</span>
              )}
            </div>
            {imagePreview && (
              <div className="mt-2">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-32 object-cover rounded-md border border-gray-300"
                />
              </div>
            )}
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-black rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-[#FFB823] text-black rounded-md hover:bg-[#ffad00] transition-colors font-medium"
            >
              Create Post
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}