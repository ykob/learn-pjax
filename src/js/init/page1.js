export default class InitPage1 {
  constructor() {
    this.data = [
      '/learn-pjax/img/image00.jpg',
      '/learn-pjax/img/image01.jpg',
      '/learn-pjax/img/image02.jpg',
      '/learn-pjax/img/image03.jpg',
    ]
  }
  startBeforePageOpen() {
    console.log('init page1');
  }
  startAfterPageOpen() {

  }
  breakAway() {

  }
};
