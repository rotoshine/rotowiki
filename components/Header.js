import Link from 'next/link';

const Header = () => (  
  <div className="navbar navbar-default navbar-static-top">
    <div className="container">
      <div className="navbar-header">
        <button className="navbar-toggle" type="button">
          <span className="sr-only">Toggle navigation</span>
          <span className="icon-bar" />
          <span className="icon-bar" />
          <span className="icon-bar" />
        </button>
        <Link>
          <a className="navbar-brand" href="/">로토위키</a>
        </Link>        
        <Link>
          <a className="btn btn-success random-document-button-xs pull-right visible-xs" href="/document-random">
            <i className="fa fa-random"/>
          </a>
        </Link>
      </div>
      <div collapse="isCollapsed" className="navbar-collapse collapse" id="navbar-main">        
        <form className="navbar-form navbar-left" role="search" >
          <div className="form-group">
            <input type="text" className="form-control" placeholder="Search" id="search-text" />
          </div>
          <button type="submit" className="btn btn-default">Search</button>
        </form>

        <ul className="nav navbar-nav navbar-right">     
        { /*            
          <li>
            <div className="nav-right-button-wrapper">
              <button className="btn btn-primary btn-sm"><i className="fa fa-twitter" />Twitter 로그인</button>
              <button className="btn btn-info btn-sm nav-create-document-button"><i className="fa fa-file" /> 새문서</button>
              <a href="/document-random" className="btn btn-success btn-sm random-document-button"><i className="fa fa-random"></i> </a>
              <button className="btn btn-default btn-sm"><i className="fa fa-bolt"></i>단축키</button>
            </div>
          </li>
          
          <li className="{active: isActive('/logout')}">
            <div className="nav-right-button-wrapper">
              <button className="btn btn-default btn-sm logout-button"><i className="fa fa-sign-out"></i> Logout</button>
            </div>
          </li>
          */}
        </ul>
      </div>
    </div>
  </div>
);

export default Header;