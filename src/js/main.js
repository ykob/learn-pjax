import initCommon from './init/common.js'
import initIndex from './init/index.js'
import initPage1 from './init/page1.js'
import initPage2 from './init/page2.js'
import initPage3 from './init/page3.js'

const { pathname } = window.location;

const init = () => {
  history.replaceState('movePage', null, location.pathname);
  const classNameContents = '.l-contents';
  const $contents = $(classNameContents);
  const loadContents = (href) => {
    $.ajax({
      url: href,
      type: 'GET',
      dataType: 'html',
      cache: true
    })
    .done(function(data) {
      console.log("success");
      const html = $.parseHTML(data);
      //console.log(html);
      const $loadContents = $('<div/>').append(html).find(classNameContents);
      $contents.html($loadContents);
    })
    .fail(function() {
      console.log("error");
    })
    .always(function() {
      console.log("complete");
    });
  }
  $('a.js-pjax').on('click', function(event) {
    event.preventDefault();
    const href = $(this).attr('href');
    if (href == location.pathname) return;
    loadContents(href);
    history.pushState('movePage', null, href);
  });
  $(window).on('popstate', function(event){
    if (event.state == 'movePage') {
      loadContents(location.pathname);
    }
  });
}
init();
