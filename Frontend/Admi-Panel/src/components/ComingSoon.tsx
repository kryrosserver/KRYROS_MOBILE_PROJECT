export default function ComingSoon({ title = "Coming Soon", message = "This admin section will be available soon." }: { title?: string; message?: string }) {
  return (
    <div className="admin-card p-10 text-center">
      <h2 className="text-2xl font-semibold text-slate-900">{title}</h2>
      <p className="mt-2 text-slate-600">{message}</p>
    </div>
  );
}
