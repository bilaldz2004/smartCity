export function StatusBadge({ status }) {
  const statusConfig = {
    submitted: { bg: "bg-blue-100", text: "text-blue-700", border: "border-blue-200", label: "Submitted" },
    "under review": { bg: "bg-yellow-100", text: "text-yellow-700", border: "border-yellow-200", label: "Under Review" },
    assigned: { bg: "bg-purple-100", text: "text-purple-700", border: "border-purple-200", label: "Assigned" },
    "in progress": { bg: "bg-orange-100", text: "text-orange-700", border: "border-orange-200", label: "In Progress" },
    resolved: { bg: "bg-green-100", text: "text-green-700", border: "border-green-200", label: "Resolved" },
  };

  const config = statusConfig[status?.toLowerCase()] || statusConfig.submitted;

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${config.bg} ${config.text} ${config.border}`}>
      {config.label}
    </span>
  );
}
