import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/client";
import toast from "react-hot-toast";

export default function AddEditDoc() {
  const { id } = useParams();
  const nav = useNavigate();
  const [form, setForm] = useState({ title: "", content: "", tags: "" });
  const [versions, setVersions] = useState([]);
  const [userInfo, setUserInfo] = useState(null);
  const [docOwner, setDocOwner] = useState(null);

  useEffect(() => {
    let userStr = localStorage.getItem("user");
    if (userStr) {
      setUserInfo(JSON.parse(userStr));
    }
    if (id) load();
  }, [id]);

  async function load() {
    try {
      const { data } = await api.get(`/docs/${id}`);
      setForm({
        title: data.title,
        content: data.content,
        tags: (data.tags || []).join(", "),
      });
      setVersions(data.versions || []);
      setDocOwner(data.createdBy?._id || null);
    } catch (err) {
      console.error("Error loading doc:", err);
    }
  }

  async function save() {
    try {
      const payload = {
        title: form.title,
        content: form.content,
        tags: form.tags
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      };

      if (!id) {
        await api.post("/docs/create", payload);
      } else {
        if (
          userInfo?.role === "admin" ||
          (docOwner && (userInfo?.id === docOwner || userInfo?._id === docOwner))
        ) {
          await api.patch(`/docs/${id}`, payload);
        } else {
          alert("You are not authorized to edit this document.");
          return;
        }
      }
      toast.success("Doc's Updated")
      nav("/");
    } catch (err) {
      console.error("Error saving doc:", err);
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-[1fr_320px] gap-6 p-6 bg-gray-50 min-h-screen font-poppins">
      {/* Form Section */}
      <div className="space-y-4 bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition">
        <h2 className="text-xl font-semibold text-blue-700 mb-2">
          {id ? "Edit Document" : "Create New Document"}
        </h2>

        <input
          placeholder="Title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <textarea
          rows={12}
          placeholder="Content"
          value={form.content}
          onChange={(e) => setForm({ ...form, content: e.target.value })}
          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <input
          placeholder="tags (comma separated)"
          value={form.tags}
          onChange={(e) => setForm({ ...form, tags: e.target.value })}
          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <button
          onClick={save}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
        >
          {id ? "Update" : "Save"}
        </button>
      </div>

      {/* Versions Section */}
      <div className="bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition">
        <h4 className="font-semibold text-blue-700 mb-4">History</h4>
        {versions.length === 0 ? (
          <p className="text-sm text-gray-500">No history available</p>
        ) : (
          <ul className="space-y-3 text-sm text-gray-600">
            {versions.map((v) => (
              <li
                key={v.version}
                className="p-3 bg-blue-50 border border-blue-100 rounded-lg hover:bg-blue-100/70 transition"
              >
                <div className="font-medium text-blue-700">
                  v{v.version} · {new Date(v.updatedAt).toLocaleString()}
                </div>
                <div className="text-gray-600 text-sm mt-1">
                  {(v.summary || "").slice(0, 120)}…
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
