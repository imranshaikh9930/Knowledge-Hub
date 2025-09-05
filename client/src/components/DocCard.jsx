import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function DocCard({ doc, onSummarize, onGenTags }) {
  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    let userStr = localStorage.getItem("user");
    if (userStr) {
      let user = JSON.parse(userStr);
      setUserInfo(user);
    }
  }, []);

  // Check ownership OR admin role
  const canEdit =
    userInfo &&
    (doc.createdBy?._id === userInfo.id || userInfo.role === "admin");

  return (
    <div className="border border-gray-100 bg-white rounded-2xl p-5 shadow-md hover:shadow-lg transition duration-300 font-poppins">
      {/* Title & Author */}
      <div className="flex justify-between items-center mb-3">
        <h4 className="font-semibold text-blue-700 text-lg">{doc.title}</h4>
        <span className="text-sm text-gray-500">
          {doc.createdBy?.name ? `by ${doc.createdBy.name}` : ""}
        </span>
      </div>

      {/* Content / Summary */}
      <p className="text-gray-700 whitespace-pre-wrap mb-4">
        {doc.summary || (doc.content?.slice(0, 160) + "…")}
      </p>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-4">
        {(doc.tags || []).map((t) => (
          <span
            key={t}
            className="bg-blue-50 text-blue-700 text-sm px-3 py-1 rounded-full border border-blue-200"
          >
            #{t}
          </span>
        ))}
      </div>

      {/* Actions (Visible if Owner OR Admin) */}
      {canEdit && (
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => onSummarize && onSummarize(doc)}
            className="px-4 py-1.5 bg-blue-600 text-white text-sm rounded-lg 
                       hover:bg-blue-700 transition shadow-sm"
          >
            Summarize
          </button>
          <button
            onClick={() => onGenTags && onGenTags(doc)}
            className="px-4 py-1.5 bg-blue-500 text-white text-sm rounded-lg 
                       hover:bg-blue-600 transition shadow-sm"
          >
            Generate Tags
          </button>
          <Link
            to={`/edit/${doc._id}`}
            className="px-3 py-1.5 text-sm text-blue-600 font-medium hover:underline"
          >
            Edit
          </Link>
        </div>
      )}
    </div>
  );
}
