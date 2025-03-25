import Link from 'next/link'

export default function SuccessPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12">
      <div className="container-custom max-w-md text-center">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          
          <h1 className="text-3xl font-bold mb-4">Restaurant Created Successfully!</h1>
          <p className="text-gray-600 mb-8">
            Your restaurant has been created. You can now start managing your menu and accepting bookings.
          </p>

          <div className="space-y-4">
            <Link href="/dashboard" className="btn-primary block">
              Go to Dashboard
            </Link>
            <Link href="/" className="btn-secondary block">
              Return to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
} 