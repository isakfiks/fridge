'use client'

import { useState } from 'react'
import { FaTimes } from 'react-icons/fa'

interface ReportPostModalProps {
  isOpen: boolean;
  onClose: () => void;
  postId: number;
  postTitle: string;
  postAuthor: string;
}

export default function ReportPostModal({ isOpen, onClose, postId, postTitle, postAuthor }: ReportPostModalProps) {
  const [category, setCategory] = useState('spam-scam')
  const [reason, setReason] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          postId,
          postTitle,
          postAuthor,
          category,
          reason
        }),
      })

      if (response.ok) {
        setCategory('spam-scam')
        setReason('')
        onClose()
        alert('Report submitted successfully. Thank you for helping keep our community safe.')
      } else {
        const error = await response.json()
        alert(error.message || 'Failed to submit report. Please try again.')
      }
    } catch (error) {
      console.error('Error submitting report:', error)
      alert('Failed to submit report. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setCategory('spam-scam')
    setReason('')
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#FFF1CA] rounded-xl shadow-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-black">Report Post</h2>
          <button
            onClick={handleClose}
            className="text-black/60 hover:text-black transition-colors text-xl p-1"
            aria-label="Close modal"
          >
            <FaTimes />
          </button>
        </div>

        <div className="mb-4 p-3 bg-gray-100 rounded-lg">
          <p className="text-sm text-gray-600">Reporting post:</p>
          <p className="font-medium text-black">{postTitle}</p>
          <p className="text-sm text-gray-500">by {postAuthor}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-black mb-2">
              Category
            </label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFB823] text-black bg-white"
              required
            >
              <option value="spam-scam">Spam or Scam</option>
              <option value="hate-speech">Hate Speech or Harassment</option>
              <option value="violence">Violence or Threats</option>
              <option value="nudity">Nudity or Sexual Content</option>
              <option value="impersonation">Impersonation</option>
              <option value="illegal">Illegal Activity</option>
              <option value="bullying">Bullying or Abusive Language</option>
            </select>
          </div>

          <div>
            <label htmlFor="reason" className="block text-sm font-medium text-black mb-2">
              Reason
            </label>
            <textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFB823] resize-none text-black bg-white"
              required
              placeholder="Can you specifically describe what this post contains, that makes it fit the category?"
            />
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
              {isSubmitting ? 'Reporting...' : 'Submit Report'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}