import { useState } from 'react';
import PageHeader from '../../components/layout/PageHeader';

const ExamCreate = () => {
  const [formData, setFormData] = useState({
    courseCode: '',
    examName: '',
    examDate: '',
    startTime: '',
    endTime: '',
    venue: ''
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
      const response = await fetch('/api/exams', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          courseCode: formData.courseCode,
          examName: formData.examName,
          examDate: formData.examDate,
          startTime: formData.startTime,
          endTime: formData.endTime,
          venue: formData.venue
        })
      });

      if (response.ok) {
        const data = await response.json();
        const exam = data.exam || data;
        setMessage({ 
          type: 'success', 
          text: `✅ Exam created successfully!\n\nExam Details:\n• Course: ${exam.courseName || 'N/A'}\n• Code: ${exam.courseCode || formData.courseCode}\n• Exam: ${exam.examName || formData.examName}\n• Date: ${exam.examDate || formData.examDate}\n• Time: ${exam.startTime || formData.startTime} - ${exam.endTime || formData.endTime}\n• Venue: ${exam.venue || formData.venue}\n• ID: ${exam._id || exam.id || 'N/A'}`
        });
        // Reset form
        setFormData({
          courseCode: '',
          examName: '',
          examDate: '',
          startTime: '',
          endTime: '',
          venue: ''
        });
      } else {
        const error = await response.json().catch(() => ({ message: 'Failed to create exam' }));
        setMessage({ type: 'error', text: error.message || 'Failed to create exam' });
      }
    } catch (error) {
      console.error('Exam creation error:', error);
      const errorMsg = error.message.includes('Failed to fetch') 
        ? 'Network error: Unable to connect to the API server. Please check your connection.' 
        : `Error: ${error.message}`;
      setMessage({ type: 'error', text: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader title="Create New Exam" />
      
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Exam Details</h2>
          
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
                placeholder="e.g., CS404"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
              />
            </div>

            <div>
              <label htmlFor="examName" className="block text-sm font-medium text-gray-700 mb-2">
                Exam Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="examName"
                name="examName"
                value={formData.examName}
                onChange={handleChange}
                required
                placeholder="e.g., Java Full Stack"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
              />
            </div>

            <div>
              <label htmlFor="examDate" className="block text-sm font-medium text-gray-700 mb-2">
                Exam Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                id="examDate"
                name="examDate"
                value={formData.examDate}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="startTime" className="block text-sm font-medium text-gray-700 mb-2">
                  Start Time <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="startTime"
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleChange}
                  required
                  placeholder="e.g., 10:00 AM"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                />
              </div>

              <div>
                <label htmlFor="endTime" className="block text-sm font-medium text-gray-700 mb-2">
                  End Time <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="endTime"
                  name="endTime"
                  value={formData.endTime}
                  onChange={handleChange}
                  required
                  placeholder="e.g., 01:00 PM"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                />
              </div>
            </div>

            <div>
              <label htmlFor="venue" className="block text-sm font-medium text-gray-700 mb-2">
                Venue <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="venue"
                name="venue"
                value={formData.venue}
                onChange={handleChange}
                required
                placeholder="e.g., Hall A, Block 3"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
              />
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition duration-200 font-medium shadow-md hover:shadow-lg"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating Exam...
                  </span>
                ) : (
                  'Create Exam'
                )}
              </button>
              <button
                type="button"
                onClick={() => setFormData({
                  courseCode: '',
                  examName: '',
                  examDate: '',
                  startTime: '',
                  endTime: '',
                  venue: ''
                })}
                className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition duration-200 font-medium"
              >
                Clear
              </button>
            </div>
          </form>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-900 mb-2">💡 Tips:</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Make sure the course code exists in the system</li>
              <li>• Use format "HH:MM AM/PM" for time fields</li>
              <li>• Venue should include hall name and block number</li>
              <li>• Select a future date for the exam</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExamCreate;
