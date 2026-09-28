export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to Metro CRM
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Auth Module to be implemented
          </p>
        </div>
        {/* Placeholder for Login Form */}
        <div className="bg-white p-8 rounded-lg shadow">
          <div className="space-y-4">
            <div className="h-10 bg-gray-100 rounded animate-pulse"></div>
            <div className="h-10 bg-gray-100 rounded animate-pulse"></div>
            <div className="h-10 bg-blue-100 rounded animate-pulse mt-6"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
