export default class Pjax {
  constructor() {
    this.classNameLink = 'a.js-pjax';
    this.classNameWrap = '.l-contents';
    this.$wrap = $(this.classNameWrap);
    this.htmlLoaded = null;
    this.$contentsLoaded = null;
    this.$overlay = $('.l-pjax-overlay');

    this.init();
  }
  init() {
    const _this = this;
    history.replaceState('init', null, location.pathname);
    $(this.classNameLink).on('click.pjax', function(event) {
      _this.click(event, $(this))
    })
    $(window).on('popstate.pjax', function(event) {
      switch (event.state) {
        case 'movePage':
          _this.load(location.pathname);
          break;
        case 'init':
          _this.load(location.pathname);
          break;
        default:
      }
    });
  }
  load(href) {
    $.ajax({
      url: href,
      type: 'GET',
      dataType: 'html',
      cache: true
    })
    .done((data) => {
      console.log("success");
      this.success(data);
    })
    .fail(() => {
      console.log("error");
    })
    .always(() => {
      console.log("complete");
    });
  }
  click(event, $this) {
    event.preventDefault();
    const href = $this.attr('href');
    if (href == location.pathname) return;
    this.close(href);
  }
  success(data) {
    const _this = this;
    this.htmlLoaded = null;
    this.$contentsLoaded = null;
    this.htmlLoaded = $.parseHTML(data);
    this.$contentsLoaded = $('<div/>').append(this.htmlLoaded).find(this.classNameWrap);
    this.$wrap.empty();
    this.$contentsLoaded.find(this.classNameLink).on('click.pjax', function(event) {
      _this.click(event, $(this))
    });
    this.$wrap.html(this.$contentsLoaded);
    this.open();
  }
  close(href) {
    this.$overlay.addClass('is-spread');
    this.$overlay.on('animationend.pjaxSpread', () => {
      this.load(href);
      history.pushState('movePage', null, href);
      this.$overlay.off('animationend.pjaxSpread');
    })
  }
  open() {
    this.$overlay.addClass('is-shut');
    this.$overlay.on('animationend.pjaxShut', () => {
      this.$overlay.removeClass('is-spread is-shut');
      this.$overlay.off('animationend.pjaxShut');
    })
  }
}
