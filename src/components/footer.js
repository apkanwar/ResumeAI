export default function Footer() {
  return (
    <footer className="border-t border-slate-200 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto text-center text-slate-500">
        <p>&copy; {new Date().getFullYear()} Resume Analyzer. All Rights Reserved.</p>
      </div>
    </footer>
  );
}
