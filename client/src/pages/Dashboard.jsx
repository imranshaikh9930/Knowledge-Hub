import React, { useEffect, useState } from 'react';
import api from '../api/client';
import DocCard from '../components/DocCard';
import ActivityFeed from '../components/ActivityFeed';
import { Loader } from 'lucide-react';

export default function Dashboard() {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tag, setTag] = useState('');

  useEffect(() => { load(); }, [tag]);

  async function load() {
    setLoading(true);
    try {
      const { data } = await api.get('/docs/', { params: { tag } });
      setDocs(data.results);
    } catch (err) {
      console.error("Error loading docs:", err);
    } finally {
      setLoading(false);
    }
  }

  async function summarize(doc) {
    try {
      const { data } = await api.post(`/docs/${doc._id}/summarize`);
      setDocs(docs.map(d => d._id === doc._id ? { ...d, summary: data.summary } : d));
    } catch (err) {
      console.error("Error summarizing doc:", err);
    }
  }

  async function genTags(doc) {
    try {
      const { data } = await api.post(`/docs/${doc._id}/tags`);
      setDocs(docs.map(d => d._id === doc._id ? { ...d, tags: data.tags } : d));
    } catch (err) {
      console.error("Error generating tags:", err);
      setDocs(docs.map(d => d._id === doc._id ? { ...d, tags: [] } : d));
    }
  }

  // if (loading) {
  //   return (
  //     <div className="flex items-center justify-center min-h-screen ">
  //       <Loader className="animate-spin text-blue-600 w-12 h-12" />
  //     </div>
  //   );
  // }

  return (
    <div className="grid grid-cols-1 md:grid-cols-[1fr_300px] gap-6 p-6 min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 font-poppins">
      
      {/* Left Section */}
      <div>
        {/* Search / Filter */}
        <div className="mb-6">
          <input 
            placeholder="🔍 Filter by tag"
            value={tag}
            onChange={e => setTag(e.target.value)}
            className="w-full border border-gray-300 rounded-xl px-4 py-2 shadow-sm 
                       focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent
                       transition-all duration-200"
          />
        </div>

        {/* Documents */}
        <div className="space-y-4">
          {docs.length > 0 ? (
            docs.map(d => (
              <DocCard
                key={d._id}
                doc={d}
                onSummarize={summarize}
                onGenTags={genTags}
              />
            ))
          ) : (
            <div className="text-center py-12 bg-white rounded-xl shadow-md">
              <p className="text-gray-500">No documents found</p>
            </div>
          )}
        </div>
      </div>

      {/* Right Section - Activity Feed */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <h2 className="text-xl font-bold text-blue-700 mb-4">📌 Activity Feed</h2>
        <ActivityFeed />
      </div>
    </div>
  );
}
