import initCommon from './init/common.js'
import initIndex from './init/index.js'
import initPage1 from './init/page1.js'
import initPage2 from './init/page2.js'
import initPage3 from './init/page3.js'

const { pathname } = window.location;

const classNameLink = 'a.js-pjax';
const classNameContents = '.l-contents';
const $contents = $(classNameContents);
let htmlLoaded = null;
let $contentsLoaded = null;

const loadContents = (href) => {
  $.ajax({
    url: href,
    type: 'GET',
    dataType: 'html',
    cache: true
  })
  .done(function(data) {
    console.log("success");
    htmlLoaded = null;
    $contentsLoaded = null;
    htmlLoaded = $.parseHTML(data);
    $contentsLoaded = $('<div/>').append(htmlLoaded).find(classNameContents);
    $contents.empty();
    $contentsLoaded.find(classNameLink).on('click.pjax', function(event) {
      onClickPjax(event, $(this))
    });
    $contents.html($contentsLoaded);
  })
  .fail(function() {
    console.log("error");
  })
  .always(function() {
    console.log("complete");
  });
}
const onClickPjax = (event, $this) => {
  event.preventDefault();
  const href = $this.attr('href');
  if (href == location.pathname) return;
  loadContents(href);
  history.pushState('movePage', null, href);
}

const init = () => {
  history.replaceState('movePage', null, location.pathname);
  $(classNameLink).on('click.pjax', function(event) {
    onClickPjax(event, $(this))
  })
  $(window).on('popstate.pjax', function(event){
    if (event.state == 'movePage') {
      loadContents(location.pathname);
    }
  });
}
init();
