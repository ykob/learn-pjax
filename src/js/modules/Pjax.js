import InitIndex from '../init/index.js'
import InitPage1 from '../init/page1.js'
import InitPage2 from '../init/page2.js'
import InitPage3 from '../init/page3.js'

import Preloader from './Preloader.js'

export default class Pjax {
  constructor() {
    // Pjax遷移関連のプロパティ
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
    this.$overlay = $('.c-pjax-overlay');
    this.anchor = document.createElement("a");

    // ページ初期化関連のプロパティ
    this.initObj = {
      index: new InitIndex(),
      page1: new InitPage1(),
      page2: new InitPage2(),
      page3: new InitPage3(),
    };
    this.currentInitObj = null;
    this.preloader = new Preloader();

    // 各種フラグ
    this.isAnimate = false;

    this.init();
  }
  //
  // 基礎的なメソッド
  // ----------------------------------------
  init() {
    this.anchor.href = `${location.protocol}//${location.host}${location.pathname}`;
    this.on();
    this.initPage(null, () => {
      $('.c-preload-overlay').addClass('is-shut');
    });
    history.replaceState('movePage', null, location.pathname);
  }
  on() {
    const _this = this;
    $(this.classNameLink).on('click.pjax', function(event) {
      _this.transition(event, $(this))
    })
    $(window).on('popstate.pjax', (event) => {
      this.popstate(event);
    });
  }
  ajax(href, callback) {
    $.ajax({
      url: href,
      type: 'GET',
      dataType: 'html',
      cache: true
    })
    .done((data) => {
    })
    .fail(() => {
    })
    .always((data) => {
      this.anchor.href = `${location.protocol}//${location.host}${location.pathname}`;
      if (callback) callback(data);
    });
  }
  popstate(event) {
    if (event.originalEvent.state != 'movePage') return;
    this.closePage(() => {
      this.ajax(location.pathname, (data) => {
        this.completeTransition(data);
      });
    });
  }
  //
  // ページごとの初期化を行うメソッド
  // ----------------------------------------
  initPage(callback1, callback2) {
    const { pathname } = window.location;
    switch (pathname.replace('index.html', '')) {
      case '/learn-pjax/':
        this.currentInitObj = this.initObj.index;
        break;
      case '/learn-pjax/page1.html':
        this.currentInitObj = this.initObj.page1;
        break;
      case '/learn-pjax/page2.html':
        this.currentInitObj = this.initObj.page2;
        break;
      case '/learn-pjax/page3.html':
        this.currentInitObj = this.initObj.page3;
        break;
      default:
        this.currentInitObj = null;
    }
    if (this.currentInitObj) {
      this.preloader.start(
        this.currentInitObj.data,
        () => {
          if(callback1) callback1();
        },
        () => {
          if(callback2) callback2();
          this.currentInitObj.startBeforePageOpen();
        }
      )
    } else {
      if(callback2) callback2();
    }
  }
  //
  // ページ遷移関連のメソッド
  // ----------------------------------------
  transition(event, $this) {
    // pjax遷移させたい要素にイベントを付与するメソッド。
    event.preventDefault();
    if ($this.attr('href') == `${location.pathname.replace('index.html', '')}`) return;
    history.pushState('movePage', null, this.anchor.href);
    this.closePage(() => {
      this.ajax($this.attr('href'), (data) => {
        this.completeTransition(data);
      });
    });
  }
  completeTransition(data) {
    const _this = this;
    // gaへpageviewを送信。
    if (window.ga) ga('send', 'pageview', window.location.pathname.replace(/^\/?/, '/') + window.location.search);
    // 既に読み込んでいるページの内容を一旦空にする。
    // わざわざnullにしているのは、GCが走ってほしいという程度のこと。実際走ってくれるかは不明。
    this.$head = null;
    this.$body = null;
    this.$contentsLoaded = null;
    this.$wrap.empty();
    // Ajaxで取得したデータをheadとbodyに分け、jQueryオブジェクトに変換する。
    this.$head = $($.parseHTML(data.match(/<head[^>]*>([\s\S.]*)<\/head>/i)[0]));
    this.$body = $($.parseHTML(data.match(/<body[^>]*>([\s\S.]*)<\/body>/i)[0]));
    this.$contentsLoaded = this.$body.find(this.classNameWrap);
    // ページごとの初期化処理を開始。
    this.initPage(null, () => {
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
      this.$wrap.html(this.$contentsLoaded.html());
      // 再表示時のスクロールY値を設定。
      $('body').css({
        position: 'static',
        marginTop: 0
      });
      if (location.hash) {
        $('html, body').animate({
          scrollTop: `${$(location.hash).offset().top}px`,
        }, 0)
      }
      // body要素内のpjaxリンクにイベントを付与。
      this.$wrap.find(this.classNameLink).on('click.pjax', function(event) {
        _this.transition(event, $(this))
      });
      // 新しく生成されたページを表示。
      this.openPage();
    });
  }
  closePage(callback) {
    // pjax遷移の開始時に演出をつけたい場合はここで処理する。
    if (this.isAnimate) return;
    this.isAnimate = true;
    this.currentInitObj.breakAway();
    $('body').css({
      position: 'fixed',
      marginTop: $(window).scrollTop() * -1
    });
    this.$overlay.addClass('is-spread');
    this.$overlay.on('animationend.pjaxSpread', () => {
      this.$overlay.off('animationend.pjaxSpread');
      callback();
    })
  }
  openPage() {
    // pjax遷移の終了時に演出をつけたい場合はここで処理する。
    this.$overlay.addClass('is-shut');
    this.$overlay.on('animationend.pjaxShut', () => {
      this.$overlay.removeClass('is-spread is-shut');
      this.$overlay.off('animationend.pjaxShut');
      this.isAnimate = false;
      this.currentInitObj.startAfterPageOpen();
      // popstateによって演出終わりにlocationと表示にズレが生じた場合、再度遷移処理を走らせる。
      if (this.anchor.href != `${location.protocol}//${location.host}${location.pathname}`) {
        this.anchor.href = `${location.protocol}//${location.host}${location.pathname}`
        this.closePage(() => {
          this.ajax(this.anchor.href, (data) => {
            this.completeTransition(data);
          });
        });
      }
    })
  }
}
