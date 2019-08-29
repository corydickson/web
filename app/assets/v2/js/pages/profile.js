$(document).ready(function() {
  $('#kudos-section').on('click keypress', '.flip-card', e => {
    if ($(e.target).is('a')) {
      e.stopPropagation();
      return;
    }
    $(e.currentTarget).toggleClass('turn');
  });

  $('#tab_controller li a').click(function(e) {
    $('#tab_controller li a').removeClass('active');
    $(this).addClass('active');
    var target_class = $(this).data('href');

    $('.tab1, .tab2, .tab3, .tab4, .tab5').css('display', 'none');
    $('.' + target_class).css('display', 'block');
    e.preventDefault();
  });

  setupTabs('#activity-tabs');

  const tabSection = document.querySelector('#activity-tabs-sections');
  const updateViewBtn = document.querySelector('#update-view-btn');

  let fetchInProgress = false;

  // update activity views when scroll happens
  function updateView(ignoreScrollOffset) {
    window.setTimeout(updateView, 300);

    if (fetchInProgress) {
      return;
    }
    var is_on_activity_tab = $("#tab_controller .nav-link.active").data('href') == "tab2";
    var are_there_no_tabs = $("#tab_controller .nav-link.active").length == 0;
    if (!is_on_activity_tab && !are_there_no_tabs){
      return;
    }

    const activityContainer = document.querySelector('.tab-section.active .activities');
    const activityCount = activityContainer ? parseInt(activityContainer.getAttribute('count')) || 0 : 0;
    const loadingImg = document.querySelector('.loading_img');

    if (activityContainer.children.length < activityCount) {
      updateViewBtn.style['visibility'] = 'visible';
    } else {
      updateViewBtn.style['visibility'] = 'hidden';
      return;
    }

    if (ignoreScrollOffset || window.scrollY >= tabSection.scrollHeight) {
      const activityName = activityContainer.id;
      let page = parseInt(activityContainer.getAttribute('page')) || 0;

      fetchInProgress = true;
      loadingImg.className = loadingImg.className.replace('hidden', 'visible');

      var fetch_url = location.href.replace(location.hash, '').replace('?', '').replace('#', '');

      fetch(fetch_url + '?p=' + (++page) + '&a=' + activityName).then(
        function(response) {
          if (response.status === 200) {
            response.text().then(
              function(html) {
                const results = document.createElement('div');

                activityContainer.setAttribute('page', page);
                results.insertAdjacentHTML('afterBegin', html);

                const childs = results.children;

                while (childs.length) {
                  activityContainer.append(childs[0]);
                }

                fetchInProgress = false;
                loadingImg.className = loadingImg.className.replace('visible', 'hidden');
              }
            );
            return;
          }

          fetchInProgress = false;
          hideBusyOverlay();
        }
      ).catch(
        function() {
          fetchInProgress = false;
          loadingImg.className = loadingImg.className.replace('visible', 'hidden');
        }
      );
    }
  }

  if (updateViewBtn) {
    updateViewBtn.addEventListener('click',
      function() {
        updateView(true);
      },
      false
    );

    updateView();
  }
});

(function($) {
  $(document).on('click', '.load-more', function() {
    var address = $('#preferred-address').prop('title');
    var link = $(this);
    var page = link.data('page');
    var request = link.data('request');
    var handle = link.data('handle');

    if (!handle) {
      return;
    }

    $.ajax({
      type: 'POST',
      url: '/lazy_load_kudos/',
      data: {
        'page': page,
        'request': request,
        'address': address,
        'handle': handle,
        'csrfmiddlewaretoken': '{{csrf_token}}' // from index.html
      },
      success: function(data) {
        // if there are still more pages to load,
        // add 1 to the "Load More Posts" link's page data attribute
        // else hide the link
        if (data.has_next) {
          link.data('page', page + 1);
        } else {
          link.hide();
        }
        // append html to the posts div
        var elem = '#' + request;

        $(elem + ' div').first().append(data.kudos_html);
      },
      error: function(xhr, status, error) {
        // shit happens friends!
      }
    });
  });
}(jQuery));