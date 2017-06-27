yeoman의 angular-fullstack 기반으로 작성된 wiki이다. ![build status](https://travis-ci.org/rotoshine/rotowiki.svg?branch=master)

# rotowiki 설치 전에 설치 되어야 하는 것
* mongodb

# 필요 모듈 설치
```
npm install -g bower
npm install -g grunt-cli
```

# 설치
```
git clone https://github.com/rotoshine/rotowiki.git
cd rotowiki
npm install && bower install
```

# twitter login 설정 및 파일 업로드 경로 설정
rotowiki에서는 사용자 인증 시스템으로 twitter를 사용하고 있다.

*server/config/* 폴더 아래에 *local.env.js* 를 생성한다.

```javascript
'use strict';
module.exports = {
  DOMAIN:           'http://localhost:9000', // 이 url 기준으로 oauth callback url이 생성됨.
  SESSION_SECRET:   'rotowiki-secret',

  TWITTER_ID:       'app-id',
  TWITTER_SECRET:   'secret',

  // Control debug level for modules using visionmedia/debug
  DEBUG: '',
  
  UPLOAD_PATH: './uploads/' // 파일 업로드 경로를 설정한다. 기본은 ./uploads/
};

```


# 실행
```
// 개발환경인 경우
grunt serve

// 운영환경인 경우
grunt serve:dist
```


# pm2로 실행하기
```
npm install -g pm2

// 프로젝트 폴더로 이동 후
pm2 start rotowiki.json

// 이후 재시작이나 정지 등
pm2 restart rotowiki
pm2 stop rotowiki
```
# DEMO
[http://wiki.winterwolf.xyz/](http://wiki.winterwolf.xyz/)

# TODO
* e2e 테스트 코드 작성
