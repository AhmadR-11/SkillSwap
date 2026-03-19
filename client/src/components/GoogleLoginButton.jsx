import React from 'react';

export default function GoogleLoginButton({ role }) {
  const handleGoogleLogin = () => {
    window.location.href = `${process.env.REACT_APP_API_URL}/api/auth/google?role=${role}`;
  };

  // Role-based colors
  const getRoleColor = () => {
    switch(role) {
      case 'admin': return 'bg-indigo-600 hover:bg-indigo-700';
      case 'freelancer': return 'bg-teal-600 hover:bg-teal-700';
      case 'client': return 'bg-pink-600 hover:bg-pink-700';
      default: return 'bg-indigo-600 hover:bg-indigo-700';
    }
  };

  return (
    <button
      type="button"
      onClick={handleGoogleLogin}
      className={`w-full flex items-center justify-center py-3 px-4 rounded-md ${getRoleColor()} text-white font-medium transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 mt-4`}
    >
      <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
        <path
          fill="currentColor"
          d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"
        />
      </svg>
      Continue with Google
    </button>
  );
}