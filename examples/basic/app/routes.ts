import { collectRoutes } from '@pizzajsdev/app-router-fs'
import { createRouterConfig } from '@pizzajsdev/app-router-fs/adapters/react-router'

export const collectedRoutes = collectRoutes('routes', ['.tsx', '.ts'], process.cwd() + '/app')
const routes = createRouterConfig(collectedRoutes)

export default routes
