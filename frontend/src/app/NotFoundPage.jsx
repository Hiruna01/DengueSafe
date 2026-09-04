import { useNavigate } from 'react-router-dom'
import { Button, Card, EmptyState } from '../shared'

export default function NotFoundPage() {
  const navigate = useNavigate()

  return (
    <Card>
      <EmptyState
        title="Page not found"
        description="That route doesn't exist."
        action={
          <Button variant="secondary" onClick={() => navigate('/')}>
            Back to the risk board
          </Button>
        }
      />
    </Card>
  )
}
