import { Link } from 'react-router'

export function Welcome() {
  return (
    <main className="flex items-center justify-center pt-16 pb-4">
      <div className="flex-1 flex flex-col items-center gap-16 min-h-0">
        <header className="flex flex-col items-center gap-9">
          <h1 className="text-4xl font-bold">Welcome to Pizzajs</h1>
          <Link
            to="/demos"
            className="text-blue-500 hover:text-blue-600 font-medium p-2 rounded-md border border-blue-500"
          >
            Layout Demo
          </Link>
        </header>
        <div className="max-w-[300px] w-full space-y-6 px-4">
          <nav className="rounded-3xl border border-gray-200 p-6 dark:border-gray-700 space-y-4">
            <p className="leading-6 text-gray-700 dark:text-gray-200 text-center">Reference Links</p>
            <ul>
              {resources.map(({ href, text, icon }) => (
                <li key={href}>
                  <a
                    className="group flex items-center gap-3 self-stretch p-3 leading-normal text-blue-700 hover:underline dark:text-blue-500"
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {icon}
                    {text}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </main>
  )
}

const resources = [
  {
    href: 'https://pizzajs.dev',
    text: 'PizzaJS Website',
    icon: null,
  },
  {
    href: 'https://reactrouter.com/docs',
    text: 'React Router Docs',
    icon: null,
  },
  {
    href: 'https://rmx.as/discord',
    text: 'Join Remix Discord',
    icon: null,
  },
]
