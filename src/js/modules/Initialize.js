import InitIndex from '../init/index.js'
import InitPage1 from '../init/page1.js'
import InitPage2 from '../init/page2.js'
import InitPage3 from '../init/page3.js'

import Preloader from './Preloader.js'

export default class Initialize {
  constructor() {
    this.init = {
      index: new InitIndex(),
      page1: new InitPage1(),
      page2: new InitPage2(),
      page3: new InitPage3(),
    };
    this.current = null;
    this.preloader = new Preloader();
  }
  run(callback1, callback2) {
    const { pathname } = window.location;
    switch (pathname.replace('index.html', '')) {
      case '/':
        this.current = this.init.index;
        break;
      case '/page1.html':
        this.current = this.init.page1;
        break;
      case '/page2.html':
        this.current = this.init.page2;
        break;
      case '/page3.html':
        this.current = this.init.page3;
        break;
      default:
    }
    this.preloader.start(
      this.current.data,
      () => {
        if(callback1) callback1();
      },
      () => {
        this.current.run();
        if(callback2) callback2();
      }
    )
  }
}
