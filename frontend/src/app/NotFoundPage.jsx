import { Link } from 'react-router-dom'
import { Button, Card, EmptyState } from '../shared'

export default function NotFoundPage() {
  return (
    <Card>
      <EmptyState
        title="Page not found"
        description="That route doesn't exist."
        action={
          <Button as="span" variant="secondary">
            <Link to="/">Back to dashboard</Link>
          </Button>
        }
      />
    </Card>
  )
}
