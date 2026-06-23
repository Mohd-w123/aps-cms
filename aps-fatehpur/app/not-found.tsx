import Link from "next/link";

export default function NotFound() {
  return (
    <section className="min-h-[70vh] flex items-center justify-center px-4 py-16" style={{ background: "linear-gradient(135deg, var(--bg-light, #f6faf5), #ffffff)" }}>
      <div className="max-w-xl text-center">
        <p className="text-sm font-semibold tracking-wider uppercase" style={{ color: "var(--school-primary, #499f42)" }}>
          Error 404
        </p>
        <h1 className="mt-2 text-4xl md:text-5xl font-bold" style={{ color: "var(--text-dark, #22235b)" }}>
          Page Not Found
        </h1>
        <p className="mt-4 text-base" style={{ color: "var(--text-muted-color, #6b7280)" }}>
          The page you are looking for does not exist or may have been moved.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center rounded-full px-6 py-3 text-sm font-semibold text-white shadow-lg transition-transform hover:scale-105"
            style={{ backgroundColor: "var(--school-primary, #499f42)" }}
          >
            Go To Homepage
          </Link>
          <Link
            href="/contact"
            className="inline-flex items-center rounded-full px-6 py-3 text-sm font-semibold border border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            Contact Us
          </Link>
        </div>
      </div>
    </section>
  );
}
