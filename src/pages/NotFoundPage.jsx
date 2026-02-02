import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components'

const NotFoundPage = () => {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4 py-10 text-center">
      <div className="max-w-md">
        <div className="mb-6 flex justify-center">
          <div className="w-24 h-24 rounded-full bg-primary-100 flex items-center justify-center">
            <span className="text-5xl font-bold text-primary-500">404</span>
          </div>
        </div>

        <h1 className="text-2xl sm:text-3xl font-semibold text-primary-500 mb-3">
          Oops! Page not found
        </h1>

        <p className="text-sm sm:text-base text-primary-200 font-medium mb-8">
          The page you’re looking for doesn’t exist or has been moved. Let’s get you back on track.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
          <Button
            variant="primary"
            size="lg"
            className="w-full sm:w-auto"
            onClick={() => navigate(-1)}
          >
            Go Back
          </Button>
          <Button
            variant="secondary"
            size="lg"
            className="w-full sm:w-auto"
            onClick={() => navigate('/')}
          >
            Back to Home
          </Button>
        </div>
      </div>
    </div>
  )
}

export default NotFoundPage

