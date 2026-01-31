import { Link } from "react-router-dom";

function Home() {
  return (
    <div className="min-h-screen bg-main pt-28 px-6">
      <div className="max-w-5xl mx-auto">

        <h1 className="text-4xl font-bold mb-4">
          Welcome to <span className="text-sky-600">SmartEAI</span>
        </h1>

        <p className="text-secondary mb-10 max-w-xl">
          Choose what you want to work on. SmartEAI helps you move from
          unstructured input to ready-to-apply documents.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

          <Link to="/dashboard">
            <div className="p-6 rounded-xl bg-white border hover:shadow-lg transition">
              <h3 className="text-xl font-semibold mb-2">📊 Dashboard</h3>
              <p className="text-secondary">
                Analyze resumes, match skills, and view insights.
              </p>
            </div>
          </Link>

          <Link to="/editor">
            <div className="p-6 rounded-xl bg-white border hover:shadow-lg transition">
              <h3 className="text-xl font-semibold mb-2">✍️ Editor</h3>
              <p className="text-secondary">
                Generate and edit cover letters or cold mails.
              </p>
            </div>
          </Link>

        </div>

      </div>
    </div>
  );
}

export default Home;
