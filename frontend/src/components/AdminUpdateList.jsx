import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import axiosClient from '../utils/axiosClient';

function AdminUpdateList() {
  const navigate = useNavigate();
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProblems = async () => {
      try {
        setLoading(true);
        const { data } = await axiosClient.get('/problem/getAllProblem');
        setProblems(data);
      } catch (err) {
        console.error(err);
        setError('Failed to load problems.');
      } finally {
        setLoading(false);
      }
    };

    fetchProblems();
  }, []);

  const difficultyBadge = (difficulty) => {
    const map = {
      easy: 'badge-success',
      medium: 'badge-warning',
      hard: 'badge-error'
    };
    return `badge ${map[difficulty] || 'badge-ghost'}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <p className="text-error">{error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Update Problem</h1>

      {problems.length === 0 ? (
        <p>No problems found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Difficulty</th>
                <th>Tag</th>
                <th className="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {problems.map((problem) => (
                <tr key={problem._id}>
                  <td>{problem.title}</td>
                  <td>
                    <span className={difficultyBadge(problem.difficulty)}>
                      {problem.difficulty}
                    </span>
                  </td>
                  <td>{problem.tags}</td>
                  <td className="text-right">
                    <button
                      className="btn btn-sm btn-primary"
                      onClick={() => navigate(`/admin/update/${problem._id}`)}
                    >
                      Update
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default AdminUpdateList;