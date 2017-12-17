import Head from 'next/head';
import Header from '../components/Header';

function createOGTags(meta) {
  const { url, title, image, description } = meta;

  return [
    <link key={1} rel="canonical" href={url} />,
    <meta key={2} name="description" content={description} />,
    <meta key={3} property="og:title" content={title} />,
    <meta key={4} property="og:type" content="article" />,
    <meta key={5} property="og:url" content={url} />,
    <meta key={6} property="og:description" content={description.slice(0, 30)} />,
    <meta key={7} property="og:image" content={image} />,
    <meta key={8} name="twitter:card" value="summary_large_image" />,
    <meta key={9} name="twitter:site" content="@winterwolf0412" />,
    <meta key={10} name="twitter:title" content={title} />,
    <meta key={11} name="twitter:description" content={description} />,    
    <meta key={12} name="twitter:image" content={image} />,
    <meta key={13} name="viewport" content="width=device-width,minimum-scale=1,initial-scale=1" />
  ];
}

export default ({ title = "로토위키", meta = null, children }) => (
  <div className="App">
    <Head>
      <title>{title}</title>
      <meta charSet="UTF-8" />
      {meta && createOGTags(meta)}
      <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/latest/css/bootstrap.min.css" />
      <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css" rel="stylesheet" integrity="sha384-wvfXpqpZZVQGK6TAh5PVlGOfQNHSoD2xbE+QkPxCAFlNEevoEH3Sl0sibVcOQVnN" crossOrigin="anonymous" />
    </Head>
    <Header />
    <div className="container">
      {children}
    </div>
    <style jsx global>{`
      @import url(http://fonts.googleapis.com/earlyaccess/nanumgothic.css);
      
      body{
        font-family: 'Nanum Gothic', sans-serif;
      }
      
      /**
       * App-wide Styles
       */
      
      .browsehappy {
          margin: 0.2em 0;
          background: #ccc;
          color: #000;
          padding: 0.2em 0;
      }
      
      .footer{
        height:10px;
        width:100%;
        text-align: center;
      }
      
      /* navbar */
      .random-document-button-xs{
        margin-top:8px;
        margin-right:5px;
      }
      .logout-button{
        margin-left:15px;
      }
      .nav-right-button-wrapper{
        padding-top:10px;
        padding-left:5px;
      }
      
      .search-result-footer{
        position:absolute;
        bottom:0;
        left:0;
        width:100%;
        padding: 10px;
      }
      
      @media screen and (max-width: 768px){
        .search-result-wrapper{
          width:100%;
          height:100%;
          margin: 0 auto;
          position:absolute;
          border:1px solid #cccccc;
          background-color:#ffffff;
          left:0;
          top:0;
          z-index: 30;
          padding-top:50px;
        }
      }
      
      @media screen and (min-width: 992px){
        .search-result-wrapper{
          width:300px;
          height:500px;
          border:1px solid #cccccc;
          background-color:#ffffff;
          position:absolute;
          top: 50px;
          margin-left:91px;
          z-index:20;
        }
      }
      
      
      .no-right-padding{
        padding-right:0;
      }
      /* document */
      .document-top-buttons{
        padding-top:50px;
      }
      .document-bottom-buttons{
        margin-bottom:15px;
      }
      .parent-search-result{
        height: 200px;
        padding:6px 12px;
        border:1px solid #cccccc;
      }
      
      .selectable{
        cursor: pointer;
      }
      
      .selectable:hover{
        background-color:#eeeeee;
      }
      
      .selected{
        background-color: #0091ea;
        color:white;
      }
      /* document edit */
      .markdown-view img {
        max-width:100%;
        height:auto;
      }
      
      /* document all */
      .item{
        width: 100%;
      }
      @media screen and (min-width: 768px){
        .item{
          width: 50%;
        }
      }
      @media screen and (min-width: 992px){
        .item{
          width: 33%;
        }
      }
      @media screen and (min-width:993px){
        .item{
          width:25%;
        }
      }
      
      .item .panel-body{
        overflow-x: auto;
      }
      
      .document-all-load-button{
        width: 100%;
      }
      @media screen and (min-width: 768px){
        .document-all-load-button{
          width: 100%;
        }
      }
      @media screen and (min-width: 992px){
        .document-all-load-button{
          width: 50%;
        }
      }
      @media screen and (min-width:993px){
        .document-all-load-button{
          width: 30%;
        }
      }
      
      
      .backdrop{
        position: fixed;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
        z-index: 1040;
        background-color: rgb(0, 0, 0);
        background-color: rgba(0, 0, 0, 0.3);
      }
      .backdrop .backdrop-message{
        position:fixed;
        left:50%;
        top:50%;
        margin-left:-24.5px;
        margin-top:-23px;
      }
      
      .nav-tabs li{
        cursor: pointer;
      }
      
      .share-twitter-button{
        margin-right:20px;
      }
      
      .default-bottom-half-margin{
        margin-bttom:5px;
      }
      
      .default-bottom-margin{
        margin-bottom:10px;
      }
      
      .default-right-margin{
        margin-right:10px;
      }
      
      .inline-block{
        display:inline-block;
      }
      
      .nav-profile-image{
        margin-top:-5px;
        width:30px;
        height:30px;
        border:1px solid #eeeeee;
        border-radius: 15px;
      }
    `}</style>
  </div>
);