import { createHonoNodeServer } from '@pizzajsdev/react-router-hono/presets/node/server'
import { getLoadContext } from './context.server'

export default await createHonoNodeServer({
  getLoadContext: getLoadContext,
})
