import DocumentLink from './DocumentLink';

const SubDocuments = ({ subDocuments }) => {
  if (!subDocuments || subDocuments.length === 0) {
    return null;
  }

  return (
    <section className="panel panel-info">
      <div className="panel-heading">하위문서</div>
      <section className="panel-body">
        <ul className="list-unstyled">
          {subDocuments.map((subDocument, i) => {
            return (
              <li key={i}>
                <DocumentLink title={subDocument.title}>
                  <a>{subDocument.title}</a>
                </DocumentLink>
              </li>
            )
          })}
        </ul>
      </section>
    </section>
  );
}

export default SubDocuments;
