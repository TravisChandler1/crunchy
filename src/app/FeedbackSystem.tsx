"use client";
import React, { useState, useEffect, useCallback } from "react";
import { FaStar, FaThumbsUp, FaThumbsDown } from "react-icons/fa";

type FeedbackCategory = 'taste' | 'delivery' | 'packaging' | 'overall';

interface Feedback {
  id: string;
  orderId: string;
  customerName: string;
  rating: number;
  comment: string;
  category: FeedbackCategory;
  helpful: number;
  timestamp: Date;
  verified: boolean;
}

interface FeedbackForm {
  orderId: string;
  customerName: string;
  rating: number;
  comment: string;
  category: FeedbackCategory;
}

interface RatingDistribution {
  1: number;
  2: number;
  3: number;
  4: number;
  5: number;
  [key: number]: number;
}

export default function FeedbackSystem() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [showForm, setShowForm] = useState<boolean>(false);
  const [form, setForm] = useState<FeedbackForm>({
    orderId: '',
    customerName: '',
    rating: 5,
    comment: '',
    category: 'overall'
  });
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [filter, setFilter] = useState<FeedbackCategory | 'all'>('all');
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const fetchFeedbacks = useCallback(async () => {
    try {
      setError('');
      const response = await fetch('/api/feedback');
      if (response.ok) {
        const data: Feedback[] = await response.json();
        setFeedbacks(data);
      } else {
        setError('Failed to load feedback. Please try again.');
      }
    } catch (error) {
      console.error('Failed to fetch feedbacks:', error);
      setError('Failed to load feedback. Please check your connection.');
    }
  }, []);

  useEffect(() => {
    fetchFeedbacks();
  }, [fetchFeedbacks]);

  const submitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });

      if (response.ok) {
        setSubmitted(true);
        setForm({
          orderId: '',
          customerName: '',
          rating: 5,
          comment: '',
          category: 'overall'
        });
        setTimeout(() => {
          setSubmitted(false);
          setShowForm(false);
        }, 3000);
        fetchFeedbacks();
      } else {
        setError('Failed to submit feedback. Please try again.');
      }
    } catch (error) {
      console.error('Failed to submit feedback:', error);
      setError('Failed to submit feedback. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const markHelpful = async (feedbackId: string, helpful: boolean) => {
    try {
      const response = await fetch('/api/feedback/helpful', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feedbackId, helpful })
      });
      
      if (response.ok) {
        fetchFeedbacks();
      } else {
        console.error('Failed to mark feedback as helpful');
      }
    } catch (error) {
      console.error('Failed to mark feedback as helpful:', error);
    }
  };

  const renderStars = (
    rating: number, 
    interactive: boolean = false, 
    onRate?: (rating: number) => void
  ) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type={interactive ? "button" : undefined}
            onClick={interactive && onRate ? () => onRate(star) : undefined}
            className={`${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'} transition-transform`}
            disabled={!interactive}
            aria-label={interactive ? `Rate ${star} star${star !== 1 ? 's' : ''}` : undefined}
            title={interactive ? `${star} star${star !== 1 ? 's' : ''}` : undefined}
          >
            <FaStar 
              className={`text-lg ${star <= rating ? 'text-yellow-500' : 'text-gray-300'}`}
            />
          </button>
        ))}
      </div>
    );
  };

  const getAverageRating = (): string => {
    if (feedbacks.length === 0) return '0.0';
    const sum = feedbacks.reduce((acc, feedback) => acc + feedback.rating, 0);
    return (sum / feedbacks.length).toFixed(1);
  };

  const getRatingDistribution = (): RatingDistribution => {
    const distribution: RatingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    feedbacks.forEach(feedback => {
      // Validate rating is a valid number between 1-5
      const rating = Math.round(feedback.rating);
      if (rating >= 1 && rating <= 5 && Number.isInteger(rating)) {
        distribution[rating as 1 | 2 | 3 | 4 | 5]++;
      }
    });
    return distribution;
  };

  const handleFilterChange = (category: string) => {
    if (category === 'all' || category === 'overall' || category === 'taste' || category === 'delivery' || category === 'packaging') {
      setFilter(category as FeedbackCategory | 'all');
    }
  };

  const filteredFeedbacks: Feedback[] = filter === 'all' 
    ? feedbacks 
    : feedbacks.filter((f: Feedback) => f.category === filter);

  const distribution: RatingDistribution = getRatingDistribution();

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-[#45523e]">Customer Feedback</h2>
          <button
            onClick={() => setShowForm(true)}
            className="px-6 py-2 bg-[#7ed957] text-white rounded-lg hover:bg-[#45523e] transition"
          >
            Leave Feedback
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Rating Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="text-center">
            <div className="text-4xl font-bold text-[#7ed957] mb-2">
              {getAverageRating()}
            </div>
            <div className="flex justify-center mb-2">
              {renderStars(Math.round(parseFloat(getAverageRating())))}
            </div>
            <p className="text-gray-600">Based on {feedbacks.length} reviews</p>
          </div>
          
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map(rating => (
              <div key={rating} className="flex items-center gap-2">
                <span className="text-sm w-8">{rating}★</span>
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-[#7ed957] h-2 rounded-full"
                    style={{ 
                      width: `${feedbacks.length > 0 ? (distribution[rating as keyof typeof distribution] / feedbacks.length) * 100 : 0}%` 
                    }}
                  />
                </div>
                <span className="text-sm w-8 text-right">
                  {distribution[rating as keyof typeof distribution]}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap gap-2 mb-6">
          {['all', 'overall', 'taste', 'delivery', 'packaging'].map(category => (
            <button
              key={category}
              onClick={() => handleFilterChange(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                filter === category 
                  ? 'bg-[#7ed957] text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
          ))}
        </div>

        {/* Feedback List */}
        <div className="space-y-4">
          {filteredFeedbacks.map(feedback => (
            <div key={feedback.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-[#45523e]">{feedback.customerName}</h4>
                    {feedback.verified && (
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                        Verified Purchase
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {renderStars(feedback.rating)}
                    <span className="text-sm text-gray-500">
                      {feedback.category.charAt(0).toUpperCase() + feedback.category.slice(1)}
                    </span>
                  </div>
                </div>
                <span className="text-sm text-gray-500">
                  {new Date(feedback.timestamp).toLocaleDateString()}
                </span>
              </div>
              
              <p className="text-gray-700 mb-3">{feedback.comment}</p>
              
              <div className="flex items-center gap-4 text-sm">
                <button
                  onClick={() => markHelpful(feedback.id, true)}
                  className="flex items-center gap-1 text-gray-600 hover:text-green-600 transition"
                >
                  <FaThumbsUp />
                  Helpful ({feedback.helpful})
                </button>
                <button
                  onClick={() => markHelpful(feedback.id, false)}
                  className="flex items-center gap-1 text-gray-600 hover:text-red-600 transition"
                >
                  <FaThumbsDown />
                  Not Helpful
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredFeedbacks.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No feedback found for the selected category.
          </div>
        )}
      </div>

      {/* Feedback Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-[#45523e]">Leave Your Feedback</h3>
              <button
                onClick={() => setShowForm(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            {submitted ? (
              <div className="text-center py-8">
                <div className="text-green-600 text-4xl mb-4">✓</div>
                <h4 className="text-lg font-semibold text-green-600 mb-2">
                  Thank you for your feedback!
                </h4>
                <p className="text-gray-600">
                  Your review helps us improve our service.
                </p>
              </div>
            ) : (
              <form onSubmit={submitFeedback} className="space-y-4">
                {error && (
                  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    {error}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Order ID (Optional)
                  </label>
                  <input
                    type="text"
                    value={form.orderId}
                    onChange={(e) => setForm({...form, orderId: e.target.value})}
                    placeholder="ORD-123456"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7ed957]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Your Name
                  </label>
                  <input
                    type="text"
                    value={form.customerName}
                    onChange={(e) => setForm({...form, customerName: e.target.value})}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7ed957]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({...form, category: e.target.value as FeedbackCategory})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7ed957]"
                  >
                    <option value="overall">Overall Experience</option>
                    <option value="taste">Taste & Quality</option>
                    <option value="delivery">Delivery Service</option>
                    <option value="packaging">Packaging</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Rating
                  </label>
                  <div className="flex gap-1">
                    {renderStars(form.rating, true, (rating) => setForm({...form, rating}))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Your Review
                  </label>
                  <textarea
                    value={form.comment}
                    onChange={(e) => setForm({...form, comment: e.target.value})}
                    required
                    rows={4}
                    placeholder="Tell us about your experience..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7ed957]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-[#7ed957] text-white rounded-lg hover:bg-[#45523e] transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Submitting...' : 'Submit Feedback'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}