import React, { useState } from "react";

const categories = [
  { title: "Reporting Issues", items: ["How to submit a report", "Why was my report rejected?"] },
  { title: "Tracking Reports", items: ["Check report status", "Status meanings"] },
  { title: "Account", items: ["Edit profile", "Reset password"] },
  { title: "Technical", items: ["Can't upload image", "Location issues"] },
];

export function HelpCenter() {
  const [query, setQuery] = useState("");

  const filtered = categories.map((cat) => ({
    ...cat,
    items: cat.items.filter((item) =>
      item.toLowerCase().includes(query.toLowerCase())
    ),
  }));

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="max-w-3xl mx-auto text-center mb-8">
        <h1 className="text-3xl font-bold mb-4">How can we help you?</h1>
        <input
          type="text"
          placeholder="Search for help..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full p-3 border rounded-xl shadow-sm"
        />
      </div>

      {/* Categories */}
      <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-6">
        {filtered.map((cat, i) => (
          <div key={i} className="bg-white p-5 rounded-2xl shadow">
            <h2 className="text-xl font-semibold mb-3">{cat.title}</h2>
            <ul className="space-y-2">
              {cat.items.length > 0 ? (
                cat.items.map((item, idx) => (
                  <li
                    key={idx}
                    className="text-gray-600 hover:text-black cursor-pointer"
                  >
                    {item}
                  </li>
                ))
              ) : (
                <li className="text-gray-400 text-sm">No results</li>
              )}
            </ul>
          </div>
        ))}
      </div>

      {/* FAQ */}
      <div className="max-w-3xl mx-auto mt-10">
        <h2 className="text-xl font-semibold mb-4">Popular questions</h2>
        <ul className="space-y-2 text-gray-700">
          <li>• Why is my report pending?</li>
          <li>• Can I edit a report?</li>
          <li>• Why can't I upload images?</li>
        </ul>
      </div>

      {/* Contact */}
      <div className="text-center mt-10">
        <p className="mb-3 text-gray-600">Still need help?</p>
        <button className="px-5 py-2 bg-black text-white rounded-xl">
          Contact Support
        </button>
      </div>
    </div>
  );
}
