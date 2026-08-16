import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/live-tv/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/live-tv/"!</div>
}
