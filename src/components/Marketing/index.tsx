import React, { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Calendar,
  TrendingUp,
  Eye,
  ThumbsUp,
  MessageCircle,
} from "lucide-react";
import ContentCalendar from "./ContentCalendar";
import { Creator } from "../../App";

interface AnalyticsData {
  date: string;
  views: number;
  likes: number;
  comments: number;
}

interface ContentPerformance {
  id: string;
  title: string;
  type: string;
  views: number;
  likes: number;
  comments: number;
  publishedAt: Date;
}

interface MarketingProps {
  creators: Creator[];
}

const Marketing: React.FC<MarketingProps> = ({ creators }) => {
  const [activeTab, setActiveTab] = useState<"overview" | "calendar">(
    "overview"
  );
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData[]>([]);
  const [topContent, setTopContent] = useState<ContentPerformance[]>([]);
  const [dateRange, setDateRange] = useState("7d");

  const totalViews = analyticsData.reduce((sum, data) => sum + data.views, 0);
  const totalLikes = analyticsData.reduce((sum, data) => sum + data.likes, 0);
  const totalComments = analyticsData.reduce(
    (sum, data) => sum + data.comments,
    0
  );

  return (
    <div className="max-w-7xl mx-auto pt-16 lg:pt-0 h-[200vh] lg:h-auto">
      <div className="mb-8">
        <div className="border-b border-slate-200">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab("overview")}
              className={`py-4 px-1 inline-flex items-center gap-2 border-b-2 text-sm font-medium ${
                activeTab === "overview"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
              }`}
            >
              Marketing Overview
            </button>
            <button
              onClick={() => setActiveTab("calendar")}
              className={`py-4 px-1 inline-flex items-center gap-2 border-b-2 text-sm font-medium ${
                activeTab === "calendar"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
              }`}
            >
              Content Calendar
            </button>
          </nav>
        </div>
      </div>

      {activeTab === "overview" ? (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-slate-800">
            Marketing Overview
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-2 text-slate-500 mb-4">
                <Eye className="h-5 w-5" />
                <span className="text-sm">Total Views</span>
              </div>
              <p className="text-3xl font-bold text-slate-800">{totalViews}</p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-2 text-slate-500 mb-4">
                <ThumbsUp className="h-5 w-5" />
                <span className="text-sm">Total Likes</span>
              </div>
              <p className="text-3xl font-bold text-slate-800">{totalLikes}</p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-2 text-slate-500 mb-4">
                <MessageCircle className="h-5 w-5" />
                <span className="text-sm">Total Comments</span>
              </div>
              <p className="text-3xl font-bold text-slate-800">
                {totalComments}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-slate-500" />
                <h3 className="text-lg font-semibold text-slate-800">
                  Performance Overview
                </h3>
              </div>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
              </select>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={analyticsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="views"
                    stroke="#3b82f6"
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="likes"
                    stroke="#10b981"
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="comments"
                    stroke="#f59e0b"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp className="h-5 w-5 text-slate-500" />
              <h3 className="text-lg font-semibold text-slate-800">
                Top Performing Content
              </h3>
            </div>
            {topContent.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="px-4 py-3 text-left text-sm font-medium text-slate-500">
                        Title
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-slate-500">
                        Type
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-slate-500">
                        Views
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-slate-500">
                        Likes
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-slate-500">
                        Comments
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-slate-500">
                        Published
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {topContent.map((content) => (
                      <tr key={content.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 text-sm text-slate-600">
                          {content.title}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-600">
                          {content.type}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-600">
                          {content.views}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-600">
                          {content.likes}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-600">
                          {content.comments}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-600">
                          {content.publishedAt.toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-center text-slate-500 py-8">
                No analytics data available
              </p>
            )}
          </div>
        </div>
      ) : (
        <ContentCalendar creators={creators} />
      )}
    </div>
  );
};

export default Marketing;
