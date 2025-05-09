import { Link } from 'react-router'

export default function Index() {
  return (
    <div>
      <Link
        to="/"
        className="inline-block mb-4 text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200"
      >
        ← Back to Home
      </Link>
      <p className="text-2xl font-bold">Demos Index</p>
      <ul className="flex flex-col gap-3 mt-4">
        <li>
          <Link
            to="/demos/demo-1"
            className="block px-6 py-3 bg-white border border-gray-200 rounded-lg shadow-sm text-gray-800 font-medium transition-all duration-200 hover:bg-blue-600 hover:text-white hover:shadow-md"
          >
            Demo 1
          </Link>
        </li>
        <li>
          <Link
            to="/demos/demo-2"
            className="block px-6 py-3 bg-white border border-gray-200 rounded-lg shadow-sm text-gray-800 font-medium transition-all duration-200 hover:bg-blue-600 hover:text-white hover:shadow-md"
          >
            Demo 2
          </Link>
        </li>
        <li>
          <Link
            to="/demos/demo-3"
            className="block px-6 py-3 bg-white border border-gray-200 rounded-lg shadow-sm text-gray-800 font-medium transition-all duration-200 hover:bg-blue-600 hover:text-white hover:shadow-md"
          >
            Demo 3
          </Link>
        </li>
      </ul>
    </div>
  )
}
