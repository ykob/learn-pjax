export default class InitIndex {
  constructor() {
    this.data = [
      '/learn-pjax/img/image00.jpg',
      '/learn-pjax/img/image01.jpg',
      '/learn-pjax/img/image02.jpg',
      '/learn-pjax/img/image03.jpg',
    ]
  }
  startBeforePageOpen() {
    console.log('init index');
  }
  startAfterPageOpen() {

  }
  breakAway() {

  }
}
