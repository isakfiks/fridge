'use client'

import { useState } from 'react';
import { FaTimes } from 'react-icons/fa';

interface Channel {
  id: string;
  name: string;
  description: string;
  member_count: number;
  created_at: string;
}

interface JoinChannelModalProps {
  isOpen: boolean;
  onClose: () => void;
  channels: Channel[];
  onChannelJoined: (channelId: string) => Promise<boolean>;
}

export default function JoinChannelModal({ isOpen, onClose, channels, onChannelJoined }: JoinChannelModalProps) {
  const [selectedChannelId, setSelectedChannelId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedChannelId) {
      alert('Please select a channel');
      return;
    }

    setIsSubmitting(true);
    const success = await onChannelJoined(selectedChannelId);
    
    if (success) {
      setSelectedChannelId('');
      onClose();
    } else {
      alert('Failed to join channel. Please try again.');
    }
    
    setIsSubmitting(false);
  };

  const handleClose = () => {
    setSelectedChannelId('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#FFF1CA] rounded-2xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-black">Join Channel</h2>
          <button
            onClick={handleClose}
            className="text-black/60 hover:text-black transition-colors"
            title="Close modal"
          >
            <FaTimes size={20} />
          </button>
        </div>

        {channels.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-black/60 mb-4">No channels available to join.</p>
            <button
              onClick={handleClose}
              className="px-4 py-2 bg-[#FFB823] text-black rounded-xl hover:bg-[#ffad00] transition-colors font-medium"
            >
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="channelSelect" className="block text-sm font-medium text-black mb-2">
                Select a Channel
              </label>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {channels.map((channel) => (
                  <div
                    key={channel.id}
                    className={`border rounded-xl p-3 cursor-pointer transition-colors ${
                      selectedChannelId === channel.id
                        ? 'border-[#FFB823] bg-[#FFB823]/10'
                        : 'border-[#FFB823]/30 hover:border-[#FFB823]/50'
                    }`}
                    onClick={() => setSelectedChannelId(channel.id)}
                  >
                    <div className="flex items-center space-x-3">
                      <input
                        type="radio"
                        id={`channel-${channel.id}`}
                        name="selectedChannel"
                        value={channel.id}
                        checked={selectedChannelId === channel.id}
                        onChange={() => setSelectedChannelId(channel.id)}
                        className="text-[#FFB823] focus:ring-[#FFB823]"
                      />
                      <div className="flex-1">
                        <h3 className="font-medium text-black">{channel.name}</h3>
                        <p className="text-sm text-black/60">{channel.description}</p>
                        <p className="text-xs text-black/50">{channel.member_count} members</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
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
                disabled={isSubmitting || !selectedChannelId}
                className="flex-1 px-4 py-3 bg-[#FFB823] text-black rounded-xl hover:bg-[#ffad00] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Joining...' : 'Join Channel'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}