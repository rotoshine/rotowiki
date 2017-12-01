import Head from 'next/head';
import Header from '../components/Header';

export default ({title = "로토위키", children}) => (
  <div className="App">
    <Head>
      <title>{title}</title>
      <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/latest/css/bootstrap.min.css" />
    </Head>
    <Header />
    <div className="container">
      {children} 
    </div>
  </div>
);