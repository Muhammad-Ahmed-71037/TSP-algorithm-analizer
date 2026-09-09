import { Link } from 'react-router-dom';
import { CompassIcon } from 'lucide-react';
import { EmptyState } from '../components/ui/Primitives';
import { Button } from '../components/ui/Primitives';

export default function NotFound() {
  return (
    <EmptyState
      icon={CompassIcon}
      title="Page not found"
      description="The page you're looking for doesn't exist. Head back to the dashboard to keep exploring."
      action={
        <Link to="/dashboard">
          <Button>Go to Dashboard</Button>
        </Link>
      }
    />
  );
}
