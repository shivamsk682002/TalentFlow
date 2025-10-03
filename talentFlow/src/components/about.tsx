
import { Link } from "react-router-dom";

export default function About() {
  return (
    <div className="bg-blue-50/10 min-h-screen p-6 flex justify-center">
      <div className="w-full max-w-5xl bg-white rounded-2xl shadow-xl p-10 space-y-10">
        <header className="text-center space-y-3">
          <h1 className="text-4xl font-bold text-blue-950">About TalentFlow</h1>
          <p className="text-blue-900 text-lg max-w-2xl mx-auto">
            TalentFlow is a modern recruitment and candidate management platform
            designed to simplify hiring. We help teams collaborate, track
            candidates, and make data-driven decisions with ease.
          </p>
        </header>

        <section>
          <h2 className="text-2xl font-semibold text-blue-950 mb-3">Our Mission</h2>
          <p className="text-blue-900 leading-relaxed">
            At TalentFlow, our mission is to empower companies to discover,
            evaluate, and hire the best talent faster. We believe hiring should
            be transparent, collaborative, and human-centric — not slowed down
            by messy spreadsheets and endless email threads.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-blue-950 mb-6">What We Offer</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-xl border border-blue-100 bg-blue-50/40 hover:shadow-md transition">
              <h3 className="font-semibold text-blue-950 mb-2">Smart Kanban</h3>
              <p className="text-blue-900 text-sm">
                Track candidates across hiring stages with a drag-and-drop
                Kanban board.
              </p>
            </div>
            <div className="p-6 rounded-xl border border-blue-100 bg-blue-50/40 hover:shadow-md transition">
              <h3 className="font-semibold text-blue-950 mb-2">Assessments</h3>
              <p className="text-blue-900 text-sm">
                Create tailored assessments to evaluate skills and ensure the
                best fit.
              </p>
            </div>
            <div className="p-6 rounded-xl border border-blue-100 bg-blue-50/40 hover:shadow-md transition">
              <h3 className="font-semibold text-blue-950 mb-2">Collaboration</h3>
              <p className="text-blue-900 text-sm">
                Share notes, timelines, and feedback with your team in one
                place.
              </p>
            </div>
          </div>
        </section>

        <footer className="flex justify-center gap-4 pt-6 border-t border-blue-100">
          <Link
            to="/"
            className="px-5 py-2 rounded-lg border border-blue-500 text-blue-950 hover:bg-blue-50 transition"
          >
            Back to Home
          </Link>
          <Link
            to="/jobs"
            className="px-5 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
          >
            Explore Jobs
          </Link>
        </footer>
      </div>
    </div>
  );
}
