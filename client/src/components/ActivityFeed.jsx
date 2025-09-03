import React, { useEffect, useState } from 'react';
import api from '../api/client';

export default function ActivityFeed() {
  const [acts, setActs] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get('/docs', { params: { limit: 5, mode: "keyword" } });
        setActs(data.results); 
      } catch (err) {
        console.error("Failed to fetch activity:", err);
      }
    })();
  }, []);

  return (
    <div className="border border-gray-100 bg-white rounded-2xl p-5 shadow-md hover:shadow-lg transition">
      {/* Header */}
      <h4 className="font-semibold text-blue-700 mb-4 text-lg">Team Activity</h4>

      {/* Activity List */}
      {acts.length === 0 ? (
        <p className="text-sm text-gray-500 text-center">No recent activity</p>
      ) : (
        <ul className="space-y-3">
          {acts.map(d => (
            <li 
              key={d._id} 
              className="text-sm bg-blue-50 border border-blue-100 rounded-lg p-3 hover:bg-blue-100/70 transition"
            >
              <span className="font-medium text-blue-700">{d.title}</span>
              <div className="text-xs text-gray-500 mt-1">
                {d.createdBy?.name || "Unknown"} · {new Date(d.updatedAt).toLocaleString()}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
