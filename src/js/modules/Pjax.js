import Initialize from './Initialize.js'

export default class Pjax {
  constructor() {
    this.classNameLink = 'a.js-pjax';
    this.classNameWrap = '.l-contents';
    this.$wrap = $(this.classNameWrap);
    this.$head = null;
    this.$body = null;
    this.$contentsLoaded = null;
    this.$meta = {
      desc: $('meta[name="description"]'),
      keys: $('meta[name="keywords"]'),
      ogTitle: $('meta[property="og:title"]'),
      ogDesc: $('meta[property="og:description"]'),
      ogUrl: $('meta[property="og:url"]'),
      twTitle: $('meta[name="witter:title"]'),
      twDesc: $('meta[name="twitter:description"]'),
    }
    this.$overlay = $('.l-pjax-overlay');
    this.anchor = document.createElement("a")
    this.pageInit = new Initialize();

    this.init();
  }
  init() {
    const _this = this;
    $(this.classNameLink).on('click.pjax', function(event) {
      _this.click(event, $(this))
    })
    $(window).on('popstate.pjax', function(event) {
      if (event.originalEvent.state != 'movePage') return;
      _this.close(() => {
        _this.load(location.pathname);
      });
    });
    history.replaceState('movePage', null, location.pathname);
  }
  load(href) {
    $.ajax({
      url: href,
      type: 'GET',
      dataType: 'html',
      cache: true
    })
    .done(() => {
      console.log("success");
    })
    .fail(() => {
      console.log("error");
    })
    .always((data) => {
      console.log("complete");
      this.complete(data);
    });
  }
  click(event, $this) {
    // pjax遷移させたい要素にイベントを付与するメソッド。
    event.preventDefault();
    this.anchor.href = $this.attr('href');
    if (this.anchor.href == `${location.protocol}//${location.host}${location.pathname}`) return;
    this.close(() => {
      this.load(this.anchor.href);
      history.pushState('movePage', null, this.anchor.href);
    });
  }
  complete(data) {
    const _this = this;
    // 既に読み込んでいるページの内容を一旦空にする。
    // わざわざnullにしているのは、GCが走ればいいなぁ程度で…実際走ってくれるかは不明。
    this.$head = null;
    this.$body = null;
    this.$contentsLoaded = null;
    this.$wrap.empty();
    // Ajaxで取得したデータをheadとbodyに分け、jQueryオブジェクトに変換する。
    this.$head = $($.parseHTML(data.match(/<head[^>]*>([\s\S.]*)<\/head>/i)[0]));
    this.$body = $($.parseHTML(data.match(/<body[^>]*>([\s\S.]*)<\/body>/i)[0]));
    this.$contentsLoaded = this.$body.find(this.classNameWrap);
    // body要素内のpjaxリンクにイベントを付与。
    this.$contentsLoaded.find(this.classNameLink).on('click.pjax', function(event) {
      _this.click(event, $(this))
    });

    this.pageInit.run(() => {
      // メタデータ更新。
      document.title = this.$head.filter('title').last().text();
      this.$meta.desc.attr('content', this.$head.filter('meta[name=description]')[0].content);
      this.$meta.keys.attr('content', this.$head.filter('meta[name=keywords]')[0].content);
      this.$meta.ogTitle.attr('content', document.title);
      this.$meta.ogDesc.attr('content', this.$meta.desc.attr('content'));
      this.$meta.ogUrl.attr('content', `${location.protocol}//${location.host}${location.pathname}`);
      this.$meta.twTitle.attr('content', document.title);
      this.$meta.twDesc.attr('content', this.$meta.desc.attr('content'));
      // コンテンツ更新。
      this.$wrap.html(this.$contentsLoaded);
      // 新しく生成されたページを表示。
      this.open();
    });
  }
  close(callback) {
    // pjax遷移の開始時に演出をつけたい場合はここで処理する。
    this.$overlay.addClass('is-spread');
    this.$overlay.on('animationend.pjaxSpread', () => {
      this.$overlay.off('animationend.pjaxSpread');
      callback();
    })
  }
  open() {
    // pjax遷移の終了時に演出をつけたい場合はここで処理する。
    this.$overlay.addClass('is-shut');
    this.$overlay.on('animationend.pjaxShut', () => {
      this.$overlay.removeClass('is-spread is-shut');
      this.$overlay.off('animationend.pjaxShut');
    })
  }
}
