import { Outlet } from 'react-router'

export default function Layout() {
  return (
    <div className="p-16">
      <Outlet />
    </div>
  )
}
