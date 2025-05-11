import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import SchedulePostModal from './SchedulePostModal';
import PostDetailModal from './PostDetailModal';

interface Creator {
  id: string;
  name: string;
  status: string;
}

interface Post {
  id: string;
  title: string;
  description: string;
  creator_id: string;
  platform: string;
  scheduled_date: string;
  media_urls?: string[];
  creator?: {
    name: string;
  };
}

const ContentCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showPostDetailModal, setShowPostDetailModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [creators, setCreators] = useState<Creator[]>([]);
  const [creatorFilter, setCreatorFilter] = useState('all');
  const [platformFilter, setPlatformFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCreators();
    fetchPosts();
  }, []);

  const fetchCreators = async () => {
    try {
      const { data, error } = await supabase
        .from('creators')
        .select('id, name, status')
        .eq('status', 'active')
        .order('name');

      if (error) throw error;

      setCreators(data || []);
    } catch (error) {
      console.error('Error fetching creators:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('scheduled_posts')
        .select(`
          *,
          creator:creators(name)
        `)
        .order('scheduled_date', { ascending: true });

      if (error) throw error;

      setPosts(data || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
  };

  const handlePreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const handleSchedulePost = async (post: Post) => {
    try {
      const { data, error } = await supabase
        .from('scheduled_posts')
        .insert([{
          title: post.title,
          description: post.description,
          creator_id: post.creator_id,
          platform: post.platform,
          scheduled_date: post.scheduled_date,
          media_urls: post.media_urls,
        }])
        .select()
        .single();

      if (error) throw error;

      setPosts(prev => [...prev, data]);
      setShowScheduleModal(false);
    } catch (error) {
      console.error('Error scheduling post:', error);
    }
  };

  const handlePostClick = (post: Post) => {
    setSelectedPost(post);
    setShowPostDetailModal(true);
  };

  const getPostsForDate = (date: Date) => {
    return filteredPosts.filter(post => {
      const postDate = new Date(post.scheduled_date);
      return (
        postDate.getDate() === date.getDate() &&
        postDate.getMonth() === date.getMonth() &&
        postDate.getFullYear() === date.getFullYear()
      );
    });
  };

  const filteredPosts = posts.filter(post => {
    if (creatorFilter !== 'all' && post.creator_id !== creatorFilter) return false;
    if (platformFilter !== 'all' && post.platform !== platformFilter) return false;
    return true;
  });

  const renderCalendar = () => {
    const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    const days = [];
    const month = currentDate.getMonth();
    const year = currentDate.getFullYear();

    // Add days from previous month
    const firstDayOfWeek = firstDay.getDay();
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      days.push(new Date(year, month, -i));
    }

    // Add days of current month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }

    // Add days from next month
    const remainingDays = 42 - days.length; // 6 rows * 7 days = 42
    for (let i = 1; i <= remainingDays; i++) {
      days.push(new Date(year, month + 1, i));
    }

    return (
      <div className="grid grid-cols-7 gap-px bg-slate-200">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
          <div key={day} className="bg-slate-50 p-2 text-sm font-medium text-slate-600">
            {day}
          </div>
        ))}
        {days.map((date, index) => {
          const isCurrentMonth = date.getMonth() === currentDate.getMonth();
          const isToday = date.toDateString() === new Date().toDateString();
          const isSelected = selectedDate?.toDateString() === date.toDateString();
          const dayPosts = getPostsForDate(date);

          return (
            <div
              key={index}
              onClick={() => setSelectedDate(date)}
              className={`bg-white p-2 min-h-[100px] cursor-pointer transition-colors ${
                !isCurrentMonth ? 'bg-slate-50' : ''
              } ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className={`text-sm ${
                  isToday ? 'bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center' :
                  !isCurrentMonth ? 'text-slate-400' : 'text-slate-600'
                }`}>
                  {date.getDate()}
                </span>
              </div>
              <div className="space-y-1">
                {dayPosts.map(post => (
                  <div
                    key={post.id}
                    className="text-xs p-1 rounded bg-blue-50 text-blue-700 truncate"
                  >
                    {post.title}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <select
            value={creatorFilter}
            onChange={(e) => setCreatorFilter(e.target.value)}
            className="px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Creators</option>
            {creators.map(creator => (
              <option key={creator.id} value={creator.id}>{creator.name}</option>
            ))}
          </select>
          <select
            value={platformFilter}
            onChange={(e) => setPlatformFilter(e.target.value)}
            className="px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Platforms</option>
            <option value="instagram">Instagram</option>
            <option value="tiktok">TikTok</option>
            <option value="youtube">YouTube</option>
          </select>
        </div>
        <button
          onClick={() => setShowScheduleModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
        >
          <Plus className="h-5 w-5" />
          Schedule Post
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center gap-4">
            <button onClick={handlePreviousMonth}>
              <ChevronLeft className="h-5 w-5 text-slate-600" />
            </button>
            <h2 className="text-lg font-semibold text-slate-800">
              {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
            </h2>
            <button onClick={handleNextMonth}>
              <ChevronRight className="h-5 w-5 text-slate-600" />
            </button>
          </div>
        </div>
        {renderCalendar()}
      </div>

      {selectedDate && (
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">
            Posts for {selectedDate.toLocaleDateString()}
          </h3>
          {getPostsForDate(selectedDate).length > 0 ? (
            <div className="space-y-4">
              {getPostsForDate(selectedDate).map(post => (
                <div
                  key={post.id}
                  onClick={() => handlePostClick(post)}
                  className="p-4 rounded-lg border border-slate-200 hover:border-blue-500 cursor-pointer transition-colors"
                >
                  <h4 className="font-medium text-slate-800">{post.title}</h4>
                  <p className="text-sm text-slate-600 mt-1">{post.description}</p>
                  <div className="flex items-center gap-4 mt-2 text-sm text-slate-500">
                    <span>{post.creator?.name}</span>
                    <span>{post.platform}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-slate-500 py-4">No posts scheduled for this date</p>
          )}
        </div>
      )}

      {showScheduleModal && (
        <SchedulePostModal
          onClose={() => setShowScheduleModal(false)}
          onSave={handleSchedulePost}
          selectedDate={selectedDate || new Date()}
          creators={creators}
        />
      )}

      {showPostDetailModal && selectedPost && (
        <PostDetailModal
          post={selectedPost}
          onClose={() => {
            setShowPostDetailModal(false);
            setSelectedPost(null);
          }}
        />
      )}
    </div>
  );
};

export default ContentCalendar;