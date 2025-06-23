'use client'

import { useState } from 'react'
import { FaTimes, FaImage, FaPoll, FaPlus, FaMinus } from 'react-icons/fa'

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPostCreated: () => void;
  selectedChannel?: string | null;
}

export default function CreatePostModal({ isOpen, onClose, onPostCreated, selectedChannel }: CreatePostModalProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [author, setAuthor] = useState('')
  const [image, setImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isPollEnabled, setIsPollEnabled] = useState(false)
  const [pollQuestion, setPollQuestion] = useState('')
  const [pollOptions, setPollOptions] = useState(['', ''])

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
  const addPollOption = () => {
    if (pollOptions.length < 6) {
      setPollOptions([...pollOptions, ''])
    }
  }

  const removePollOption = (index: number) => {
    if (pollOptions.length > 2) {
      setPollOptions(pollOptions.filter((_, i) => i !== index))
    }
  }

  const updatePollOption = (index: number, value: string) => {
    const newOptions = [...pollOptions]
    newOptions[index] = value
    setPollOptions(newOptions)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    const formData = new FormData()
    formData.append('title', title)
    formData.append('description', description)
    formData.append('author', author)
    formData.append('hasImage', image ? 'true' : 'false')
    if (image) {
      formData.append('image', image)
    }

    // Add poll data
    formData.append('hasPoll', isPollEnabled ? 'true' : 'false')
    if (isPollEnabled) {
      formData.append('pollQuestion', pollQuestion)
      formData.append('pollOptions', JSON.stringify(pollOptions.filter(option => option.trim() !== '')))
    }

    try {
      const endpoint = selectedChannel 
        ? `/api/no-login/channels/${selectedChannel}/posts`
        : '/api/no-login/posts';
        
      const response = await fetch(endpoint, {
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
        setIsPollEnabled(false)
        setPollQuestion('')
        setPollOptions(['', ''])
        onClose()
        onPostCreated() // Refresh the posts list
      } else {
        alert('Failed to create post. Please try again.')
      }
    } catch (error) {
      console.error('Error creating post:', error)
      alert('Failed to create post. Please try again.')
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
    setIsPollEnabled(false)
    setPollQuestion('')
    setPollOptions(['', ''])
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
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-black">
                Poll
              </label>
              <button
                type="button"
                onClick={() => setIsPollEnabled(!isPollEnabled)}
                className={`flex items-center px-3 py-1 rounded-lg transition-colors ${
                  isPollEnabled 
                    ? 'bg-[#FFB823] text-black' 
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                <FaPoll className="mr-2" />
                {isPollEnabled ? 'Enabled' : 'Enable Poll'}
              </button>
            </div>

            {isPollEnabled && (
              <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
                <div>
                  <label htmlFor="pollQuestion" className="block text-sm font-medium text-black mb-1">
                    Poll Question
                  </label>
                  <input
                    type="text"
                    id="pollQuestion"
                    value={pollQuestion}
                    onChange={(e) => setPollQuestion(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFB823] text-black bg-white"
                    required={isPollEnabled}
                    placeholder="What would you like to ask?"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Poll Options
                  </label>
                  {pollOptions.map((option, index) => (
                    <div key={index} className="flex items-center space-x-2 mb-2">
                      <input
                        type="text"
                        value={option}
                        onChange={(e) => updatePollOption(index, e.target.value)}
                        className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFB823] text-black bg-white"
                        placeholder={`Option ${index + 1}`}
                        required={isPollEnabled}
                      />
                      {pollOptions.length > 2 && (
                        <button
                          type="button"
                          onClick={() => removePollOption(index)}
                          className="text-red-500 hover:text-red-700 p-1"
                        >
                          <FaMinus />
                        </button>
                      )}
                    </div>
                  ))}
                  {pollOptions.length < 6 && (
                    <button
                      type="button"
                      onClick={addPollOption}
                      className="flex items-center text-sm text-[#FFB823] hover:text-[#ffad00] font-medium"
                    >
                      <FaPlus className="mr-1" />
                      Add Option
                    </button>
                  )}
                </div>
              </div>
            )}
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