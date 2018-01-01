import React from 'react';
import Layout from '../../components/Layout';

import { Well } from 'react-bootstrap';

const LoginFailPage = () => (
  <Layout title="error">
    <Well>로그인에 실패했습니다.</Well>
  </Layout>
);

export default LoginFailPage;
