import { createHonoVercelServer } from '@pizzajsdev/react-router-hono/presets/vercel/server'
import { getLoadContext } from './context.server'

export default await createHonoVercelServer({
  getLoadContext: getLoadContext,
})
