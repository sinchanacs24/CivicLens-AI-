import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { Link } from "react-router-dom";

export default function EmptyState({ message }: { message: string }) {
  return (
    <div className="glass-card mx-auto flex max-w-xl flex-col items-center gap-4 p-10 text-center">
      <ExclamationTriangleIcon className="h-10 w-10 text-amber-400" />
      <p className="text-slate-300">{message}</p>
      <Link to="/upload" className="btn-primary text-sm">
        Upload a Dataset
      </Link>
    </div>
  );
}
