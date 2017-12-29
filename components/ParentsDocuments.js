import DocumentLink from './DocumentLink';

const ParentsDocuments = ({ parents }) => {
  if (!parents || parents.length === 0) {
    return null;
  }

  const parentLinks = parents.map((parent, i) => {
    return (
      <span key={i} className="parent-link">
        <DocumentLink title={parent.title}>
          <a>
            {parent.title}
          </a>
        </DocumentLink>
        {i < parents.length - 1 && ','}
        <style jsx>{`
          .parent-link {
            font-weight: 900;
            display: inline-block;
            margin-left: 3px;
            margin-right: 3px;
          }
        `}</style>
      </span>
    );
  });

  return (
    <div className="alert alert-info" role="alert">
      이 문서는 {parentLinks} 의 하위문서 입니다.

    </div>
  );
}

export default ParentsDocuments;
