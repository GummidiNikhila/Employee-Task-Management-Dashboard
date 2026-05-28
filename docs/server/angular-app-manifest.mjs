
export default {
  bootstrap: () => import('./main.server.mjs').then(m => m.default),
  inlineCriticalCss: true,
  baseHref: '/Employee-Task-Management-Dashboard/',
  locale: undefined,
  routes: [
  {
    "renderMode": 2,
    "redirectTo": "/Employee-Task-Management-Dashboard/login",
    "route": "/Employee-Task-Management-Dashboard"
  },
  {
    "renderMode": 2,
    "route": "/Employee-Task-Management-Dashboard/login"
  },
  {
    "renderMode": 2,
    "route": "/Employee-Task-Management-Dashboard/main"
  }
],
  entryPointToBrowserMapping: undefined,
  assets: {
    'index.csr.html': {size: 748, hash: '7a799f6c5020413d83df82aa8046d56f6b0310423e9313788e79b8a28cd7c937', text: () => import('./assets-chunks/index_csr_html.mjs').then(m => m.default)},
    'index.server.html': {size: 1011, hash: 'd97e7dc75b4ac6637d31b2d9ada420e9c3499337fd69b89801aee5bcbb91e167', text: () => import('./assets-chunks/index_server_html.mjs').then(m => m.default)},
    'main/index.html': {size: 345, hash: 'bc1c3403b0e650db1175a9adc3a2d12b0db835c2509039dbe8ddb457fd1aff5c', text: () => import('./assets-chunks/main_index_html.mjs').then(m => m.default)},
    'login/index.html': {size: 14513, hash: '7db6804c4b3d36ef2e5f0d346df66c3cecc575d85df538d6568c1e4516260f9f', text: () => import('./assets-chunks/login_index_html.mjs').then(m => m.default)},
    'styles-5CWI4FOU.css': {size: 374, hash: 'FABD76MX+Vg', text: () => import('./assets-chunks/styles-5CWI4FOU_css.mjs').then(m => m.default)}
  },
};
