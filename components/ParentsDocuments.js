import Link from 'next/link';

const ParentsDocuments = ({ parents }) => {
  if (!parents || parents.length === 0) {
    return null;
  }

  const parentLinks = parents.map((parent, i) => {
    return (
      <Link key={i}>
        <a className="parent-link" href={`/documents/${parent.title}`}>
          {parent.title}
        </a>
      </Link>
    )
  });

  return (
    <div className="alert alert-info" role="alert">
      이 문서는 {parentLinks} 의 하위문서 입니다.
      <style jsx>{`
        a {
          display: inline-block;
          margin-left: 3px;
          margin-right: 3px;          
        }
      `}</style>
    </div>
  );
}

export default ParentsDocuments;