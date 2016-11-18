export default class Pjax {
  constructor(classNameLink, classNameContents) {
    this.classNameLink = classNameLink;
    this.classNameContents = classNameContents;
    this.$contents = $(classNameContents);
    this.htmlLoaded = null;
    this.$contentsLoaded = null;

    this.init();
  }
  init() {
    const _this = this;
    history.replaceState('movePage', null, location.pathname);
    $(this.classNameLink).on('click.pjax', function(event) {
      _this.onClickPjax(event, $(this))
    })
    $(window).on('popstate.pjax', function(event) {
      if (event.state == 'movePage') {
        _this.loadContents(location.pathname);
      }
    });
  }
  loadContents(href) {
    const _this = this;
    $.ajax({
      url: href,
      type: 'GET',
      dataType: 'html',
      cache: true
    })
    .done((data) => {
      console.log("success");
      this.htmlLoaded = null;
      this.$contentsLoaded = null;
      this.htmlLoaded = $.parseHTML(data);
      this.$contentsLoaded = $('<div/>').append(this.htmlLoaded).find(this.classNameContents);
      this.$contents.empty();
      this.$contentsLoaded.find(this.classNameLink).on('click.pjax', function(event) {
        _this.onClickPjax(event, $(this))
      });
      this.$contents.html(this.$contentsLoaded);
    })
    .fail(function() {
      console.log("error");
    })
    .always(function() {
      console.log("complete");
    });
  }
  onClickPjax(event, $this) {
    event.preventDefault();
    const href = $this.attr('href');
    if (href == location.pathname) return;
    this.loadContents(href);
    history.pushState('movePage', null, href);
  }
}
