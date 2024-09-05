## 프론트엔드 Svelte 개발환경

[NVM 설치](https://github.com/nvm-sh/nvm)

```bash
# nvm 설치
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
# npm v16.17.1 설치
nvm install v16.17.1 
# svelte 설치
npm create vite@latest Svelte-Sample -- --template svelte
npm install
# VS Code 세팅하기
# Svelte 서버 실행하기
npm run dev -- --host 0.0.0.0 --port 5173
# 스벨트 라우터 설치
npm install svelte-spa-router
# 모든 패키지를 최신버전으로 업데이트
npm install -g npm-check-updates
# 설치 패키지
svelte-sample@0.0.0 /workspace/Svelte-Sample
├── @sveltejs/vite-plugin-svelte@3.0.1
├── bootstrap@5.3.2
├── marked@11.1.1
├── moment@2.30.1
├── qs@6.11.2
├── svelte-spa-router@4.0.1
├── svelte@4.2.9
└── vite@5.0.12
# 배포용 빌드
npm run build
# dist 폴더에 빌드 파일이 있음
dist/index.html
dist/assets/index.xxxxx.css
dist/assets/index.xxxxx.js
```

**FastAPI 서버에 frontend 폴더에 만들어 적용하기**

```python
from starlette.responses import FileResponse
from starlette.staticfiles import StaticFiles

# assets 폴더 마운트
app.mount('/assets', StaticFiles(directory='./frontend/xxxx'))

# 링크 만들기
@app.get('/my-frontend')
def my_frontend_index():
  return FileResponse('./frontend/xxxx/index.html')
```

**자동 새로고침 안되는 문제 해결**

- [Fixing Hot Module Reload of Vite App in WSL](https://www.youtube.com/watch?v=BUClW9wTqGQ)
- ["npm run dev" not automatically refreshing with Vite 3.0.0](https://www.reddit.com/r/sveltejs/comments/vzdsc0/npm_run_dev_not_automatically_refreshing_with/)

```javascript
import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [svelte()],
	// 추가하기
	server: {
		watch: {
			usePolling: true,
		}
	}
});
```