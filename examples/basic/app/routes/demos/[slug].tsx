import { Link } from 'react-router'
import type { Route } from './+types/[slug]'

export function loader({ params }: Route.LoaderArgs) {
  return {
    slug: params.slug,
  }
}

export default function Demo({ loaderData }: Route.ComponentProps) {
  return (
    <div>
      <Link
        to="/demos"
        className="inline-block mb-4 text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200"
      >
        ← Back to Demos
      </Link>
      <div className="p-4 rounded-lg bg-blue-600 text-white border border-blue-700">Content for {loaderData.slug}</div>
    </div>
  )
}
