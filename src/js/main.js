import initCommon from './init/common.js'
import initIndex from './init/index.js'
import initPage1 from './init/page1.js'
import initPage2 from './init/page2.js'
import initPage3 from './init/page3.js'

import Pjax from './modules/Pjax.js'

// const { pathname } = window.location;

const pjax = new Pjax('a.js-pjax', '.l-contents');
