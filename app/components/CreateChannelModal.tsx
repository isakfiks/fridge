'use client'

import { useState } from 'react';
import { FaTimes } from 'react-icons/fa';

interface CreateChannelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onChannelCreated: (name: string, description: string) => Promise<boolean>;
}

export default function CreateChannelModal({ isOpen, onClose, onChannelCreated }: CreateChannelModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !description.trim()) {
      alert('Please fill in all fields');
      return;
    }

    setIsSubmitting(true);
    const success = await onChannelCreated(name.trim(), description.trim());
    
    if (success) {
      setName('');
      setDescription('');
      onClose();
    } else {
      alert('Failed to create channel. Please try again.');
    }
    
    setIsSubmitting(false);
  };

  const handleClose = () => {
    setName('');
    setDescription('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#FFF1CA] rounded-2xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-black">Create New Channel</h2>
          <button
            onClick={handleClose}
            className="text-black/60 hover:text-black transition-colors"
          >
            <FaTimes size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="channelName" className="block text-sm font-medium text-black mb-2">
              Channel Name
            </label>
            <input
              id="channelName"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter channel name"
              className="w-full px-4 py-3 border border-[#FFB823]/30 rounded-xl bg-white text-black placeholder-black/50 focus:outline-none focus:ring-2 focus:ring-[#FFB823]"
              maxLength={50}
              required
            />
          </div>

          <div>
            <label htmlFor="channelDescription" className="block text-sm font-medium text-black mb-2">
              Description
            </label>
            <textarea
              id="channelDescription"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what this channel is about"
              className="w-full px-4 py-3 border border-[#FFB823]/30 rounded-xl bg-white text-black placeholder-black/50 focus:outline-none focus:ring-2 focus:ring-[#FFB823] resize-none"
              rows={3}
              maxLength={200}
              required
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-3 border border-[#FFB823]/30 text-black rounded-xl hover:bg-[#FFB823]/10 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-3 bg-[#FFB823] text-black rounded-xl hover:bg-[#ffad00] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Creating...' : 'Create Channel'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}