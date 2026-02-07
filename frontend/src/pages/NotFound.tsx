import { Link } from 'react-router-dom';
import { Button } from '../components/ui';

function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="container-unibody max-w-md text-center">
        <h1 className="text-hierarchy-1 mb-4 text-systemRed">
          [ 404: NOT FOUND ]
        </h1>
        
        <p className="text-hierarchy-3 mb-6">
          THE REQUESTED RESOURCE DOES NOT EXIST
        </p>

        <Link to="/">
          <Button variant="primary">
            [ RETURN TO DASHBOARD ]
          </Button>
        </Link>
      </div>
    </div>
  );
}

export default NotFound;
