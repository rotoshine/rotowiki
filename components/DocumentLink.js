import { Link } from '../routes';

const DocumentLink = ({ title, children }) => (
  <Link route="document" params={{ title }}>
    {children}
  </Link>
);

export default DocumentLink;
