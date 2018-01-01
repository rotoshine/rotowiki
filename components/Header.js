import { Link } from '../routes';

const Header = ({ user }) => (
  <div className="navbar navbar-default navbar-static-top">
    <div className="container">
      <div className="navbar-header">
        <button className="navbar-toggle" type="button">
          <span className="sr-only">Toggle navigation</span>
          <span className="icon-bar" />
          <span className="icon-bar" />
          <span className="icon-bar" />
        </button>
        <Link route="/index">
          <a className="navbar-brand">로토위키</a>
        </Link>
        <Link route="randomDocument">
          <a className="btn btn-success random-document-button-xs pull-right visible-xs">
            <i className="fa fa-random" />
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
          {user &&
            <li>
              <p className="navbar-text">
                <img className="nav-profile-image" alt="user profile image" src={user.profileImageUrl} />{user.name}
              </p>
            </li>
          }
          <li>
            <div className="nav-right-button-wrapper">
              {
                !user &&
                <a href="/auth/twitter" className="btn btn-primary btn-sm login-button"><i className="fa fa-twitter" />Twitter 로그인</a>
              }
              {
                user &&
                <button className="btn btn-info btn-sm nav-create-document-button"><i className="fa fa-file" /> 새문서</button>
              }

              <a href="/document-random" className="btn btn-success btn-sm random-document-button"><i className="fa fa-random"></i> </a>
              <button className="btn btn-default btn-sm"><i className="fa fa-bolt"></i>단축키</button>
            </div>
          </li>

          {user &&
            <li>
              <div className="nav-right-button-wrapper">
                <a href="/logout" className="btn btn-default btn-sm logout-button"><i className="fa fa-sign-out"></i> Logout</a>
              </div>
            </li>
          }
        </ul>
      </div>
    </div>
    <style jsx>{`
      .nav-profile-image {
        margin-top: -5px;
        margin-right: 3px;
        width: 30px;
        height: 30px;
        border: 1px solid #eee;
        border-radius: 50%;
      }

      .login-button {
        margin-right: 5px;
      }
    `}</style>
  </div>
);

export default Header;
