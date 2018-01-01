next.js 기반으로 작성된 wiki이다. ![build status](https://travis-ci.org/rotoshine/rotowiki.svg?branch=nextjs)

# rotowiki 설치 전에 설치 되어야 하는 것
* mongodb

# 설치
```
git clone https://github.com/rotoshine/rotowiki.git
cd rotowiki
npm install
```

# twitter login 설정 및 파일 업로드 경로 설정
rotowiki에서는 사용자 인증 시스템으로 twitter를 사용하고 있다.

프로젝트 루트에 `.env` 를 생성한다.

```javascript
PORT=3000
WIKI_URL=http://localhost:3000
JWT_SECRET=public json web token key

TWITTER_ID=twitter id
TWITTER_SECRET=twitter secret
UPLOAD_FILE_PATH=

MONGODB_HOST_DEV=mongodb://localhost/rotowiki_dev
MONGODB_HOST_PRODUCTION=mongodb://localhost/rotowiki
```


# 실행
```sh
// 개발환경인 경우
npm run dev

// 운영환경인 경우
npm run start
```


# pm2로 실행하기
```
npm install -g pm2

// 프로젝트 폴더로 이동 후
pm2 start --name "rotowiki" npm -- start

// 이후 재시작이나 정지 등
pm2 restart rotowiki
pm2 stop rotowiki
```
# DEMO
[http://nextjs-wiki.roto.codes/](http://nextjs-wiki.roto.codes/)

# TODO
* e2e 테스트 코드 작성
