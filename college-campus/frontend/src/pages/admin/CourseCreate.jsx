import { useState } from 'react';
import PageHeader from '../../components/layout/PageHeader';

const CourseCreate = () => {
  const [formData, setFormData] = useState({
    courseName: '',
    courseCode: '',
    department: '',
    year: '',
    credits: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await fetch('/api/courses/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          courseName: formData.courseName,
          courseCode: formData.courseCode,
          department: formData.department,
          year: parseInt(formData.year),
          credits: parseInt(formData.credits)
        })
      });

      if (response.ok) {
        const data = await response.json();
        setMessage({ 
          type: 'success', 
          text: `✅ Course created successfully!\n\nCourse Details:\n• Name: ${data.courseName}\n• Code: ${data.courseCode}\n• Department: ${data.department}\n• Year: ${data.year}\n• Credits: ${data.credits}\n• ID: ${data._id}`
        });
        // Reset form
        setFormData({
          courseName: '',
          courseCode: '',
          department: '',
          year: '',
          credits: ''
        });
      } else {
        const error = await response.json().catch(() => ({ message: 'Failed to create course' }));
        setMessage({ type: 'error', text: error.message || 'Failed to create course' });
      }
    } catch (error) {
      console.error('Course creation error:', error);
      const errorMsg = error.message.includes('Failed to fetch') 
        ? 'CORS Error: The API server does not allow requests from this origin. Contact the API administrator to enable CORS.' 
        : `Network error: ${error.message}`;
      setMessage({ type: 'error', text: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader title="Create New Course" />
      
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Course Details</h2>
          
          {message.text && (
            <div className={`mb-4 p-4 rounded-lg ${
              message.type === 'success' 
                ? 'bg-green-100 text-green-800 border border-green-300' 
                : 'bg-red-100 text-red-800 border border-red-300'
            }`}>
              <div className="whitespace-pre-line">{message.text}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="courseName" className="block text-sm font-medium text-gray-700 mb-2">
                Course Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="courseName"
                name="courseName"
                value={formData.courseName}
                onChange={handleChange}
                required
                placeholder="e.g., Database Management System"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="courseCode" className="block text-sm font-medium text-gray-700 mb-2">
                Course Code <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="courseCode"
                name="courseCode"
                value={formData.courseCode}
                onChange={handleChange}
                required
                placeholder="e.g., CS301"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-2">
                Department <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="department"
                name="department"
                value={formData.department}
                onChange={handleChange}
                required
                placeholder="e.g., Computer Science"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-2">
                  Year <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  id="year"
                  name="year"
                  value={formData.year}
                  onChange={handleChange}
                  required
                  min="1"
                  max="4"
                  placeholder="e.g., 3"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="credits" className="block text-sm font-medium text-gray-700 mb-2">
                  Credits <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  id="credits"
                  name="credits"
                  value={formData.credits}
                  onChange={handleChange}
                  required
                  min="1"
                  max="6"
                  placeholder="e.g., 3"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
              >
                {loading ? 'Creating...' : 'Create Course'}
              </button>
              
              <button
                type="button"
                onClick={() => setFormData({
                  courseName: '',
                  courseCode: '',
                  department: '',
                  year: '',
                  credits: ''
                })}
                className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Clear
              </button>
            </div>
          </form>

          <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="text-sm font-semibold text-blue-800 mb-2">Example Courses:</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Database Management System (CS301) - Year 3, Credits 3</li>
              <li>• Operating Systems (CS302) - Year 3, Credits 4</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseCreate;
