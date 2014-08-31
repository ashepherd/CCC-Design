/*
Vimeo Simple API - https://developer.vimeo.com/apis/simple
*/

var playerURL = "//player.vimeo.com/video/";
var video_player_id = "video-player-iframe";
var video_player_title = "video-player-title";
var video_player_description = "video-player-description";
var video_player_container = "video-player-container";
jQuery.fn.reverse = [].reverse;

$(document).ready(function(){
    
    var pathname = window.location.pathname;
    var is_previous_series = '/previous-series' == pathname;
    if( is_previous_series ){
        $('section.content').remove();
    }
    
    //show the Text Element for hard-coded Vimeo series if the browser is in the editor
    $vimeoHardCodedSectionParent = $('#main_1_pnlTitle').parent();
    if( $vimeoHardCodedSectionParent.length && $vimeoHardCodedSectionParent.hasClass( "dragable" )){
        $('#main_1_pnlTitle').addClass('show');
    } else if( $('#main_1_pnlTitle').length ){
        $('#main_1_pnlTitle').removeClass('show');   
    }
    
    //add a place to place all the video content
    $( "<div/>", { "id": "video-content", "class": "video-content" }).prependTo('#video-section');
    
    //setup page based on series or video hash
    //#series-<id> or #watch-<series-id>-<video-id>
    var hash = window.location.hash;
    var is_series = false;
    var is_video = false;
    if( hash.length ){

      if( hash.substring(0, 8) == "#series-" ){
         var seriesId = hash.substring(8);
          if( $.isNumeric(seriesId) ){
              //load that series
              loadSeries(seriesId, false);
              return;
          }
      } 
      if ( hash.substring(0, 7) == "#watch-" ){
         var data = hash.substring(7);
         var dash = data.indexOf('-');
         if( dash > 0 ){
           var seriesId = data.substring(0, dash);
           var videoId = data.substring(dash+1);
           
           if( $.isNumeric(seriesId) && $.isNumeric(videoId) ){
              loadSeries(seriesId, videoId);
              return;
           }
         }
      }
    }
    
    loadAllSeriesOrWatch( is_previous_series );
});



function loadSeries( seriesId, startVideoId ){
    
    var lessons = "http://vimeo.com/api/v2/album/" + seriesId + "/videos.json";
    $.getJSON( lessons, function( data ) {
      var count = 0;
      var container_div = "#" + video_player_container;
        
      $('#video-content').empty();
      $("<div/>", { "id": video_player_container }).prependTo('#video-content');
      $( "<h1/>", {
          "id": "lesson-other-heading",
          html: "Messages"
      }).appendTo( container_div );
      $( "<ul/>", {
          "id": "lesson-list",
        "class": "lesson-list"
      }).appendTo( container_div );
        
      //to reverse the order so the oldest video is first
      //data = data.reverse();
        
      $.each( data, function( key, val ) {
          
          count++;
          
          var desc = val.description.replace(/(<([^>]+)>)/ig,"");
          var duration = val.duration;
          var height = val.height;
          var videoId = val.id;
          var numViews = val.stats_number_of_plays;
          var tags = val.tags;
          var title = val.title;
          var width = val.width;
          var uploadDate = val.upload_date;
          
          var description = desc;
          var videoUrl = playerURL + videoId;
          var viewsWord = " views";
          if( parseInt(numViews) == 1 ){
              viewsWord = " view";
          }
          var teaser = ''; //numViews + viewsWord;
          
          if( !$.isNumeric(startVideoId) && count == 1 ){
              setupVideoPlayer(seriesId, videoId, title, description);
          } else if( $.isNumeric(startVideoId) && videoId == startVideoId ){
              setupVideoPlayer(seriesId, videoId, title, description);
          }

          var title_link_id = "lesson-title-link-" + videoId;
          var title_div_id = "lesson-title-div-" + videoId;
          var desc_div_id = "lesson-desc-div-" + videoId;
          var li_id = "#" + videoId;
          $( "<li/>", { "id": videoId, "class": "lesson" }).appendTo('#lesson-list')
              .append( 
                  $( "<div/>", { "id": title_div_id, "class": "lesson-title" }).append(
                      $( "<a/>", { "href": "#watch-" + seriesId + "-" + videoId, "class": "lesson-link special-button", html: title })
                          .click( function(){
                               changeVideo( seriesId, $(this).closest("li").attr("id"));
                          })
                  )
              ).append(
                  $ ("<a/>", { "href": "#notes-" + seriesId +"-" + videoId, "class": "lesson-link special-button-alternate", html: "Discussion Notes" })
              ).append(
                  $ ("<span/>", { "class": "lesson-teaser", html: teaser } )
              );
      });
        
      $( 'body,html' ).animate({ 
        scrollTop: 0
      }, 0);
    });
}

function setupVideoPlayer(seriesId, videoId, title, description ){
  var container_div = "#" + video_player_container;
  $ ("<a/>", { 
      "href": "#notes-" + seriesId +"-" + videoId, 
      "id": "lesson-notes-current", 
      "class": "lesson-link special-button-alternate", 
      html: "Discussion Notes" }
  ).prependTo(container_div);
  $("<div/>", { "id": video_player_description, html: description }).prependTo(container_div);
  $("<br/>").prependTo(container_div);
  $( "<iframe/>",  { 
     "id": video_player_id,
     "src": playerURL + videoId, 
     "width": "700",
     "height": "393",
     "frameborder": "0" }
  ).prependTo(container_div);
  $( "<h1/>", { "id": video_player_title, "class": "title", html: title }).prependTo(container_div);   
  setPageTitle(title);
}

function changeVideo( seriesId, videoId ){
    var videoUrl = playerURL + videoId;
    var $iframe = $( "#" + video_player_id );
    var $discussion = $( "#lesson-notes-current" ); 
    if ( $iframe.length ) {
      $iframe.attr("src", videoUrl );
      var video = "http://vimeo.com/api/v2/video/" + videoId +".json";
      $.getJSON( video, function( data ) {

          var title = data[0].title;
          var $title = $( "#" + video_player_title );
          if( $title.length ){
              $title.html(title);
          }
          setPageTitle(title);
          var desc = data[0].description.replace(/(<([^>]+)>)/ig,"");
          var $desc = $( "#" + video_player_description );
          if( $desc.length ){
              $desc.html(desc);   
          }
          if( $discussion.length ){
              $discussion.attr('href', "#notes-" + seriesId +"-" + videoId );
          }
      });
      
      //scroll to the video content area
      //see: http://stackoverflow.com/questions/8149155/animate-scrolltop-not-working-in-firefox
      $( 'body,html' ).animate({ 
        scrollTop: 200
        }, 750);
    }
}

function loadAllSeriesOrWatch( is_previous_series_page ){
    
    var series = [];
    if( is_previous_series_page ){
    
        $children = $('#vimeo-albums-always-list > ul').children();
        if( $children.length ){ 
    
            $.each( $children, function( key, value ){
               $item = $( value );
               var vimeoId = $item.text();
               var seriesUrl = "http://vimeo.com/api/v2/album/" + vimeoId +"/info.json";
               $.getJSON(seriesUrl, function ( data ){
                   series.push( data );
               });
            });
        }
    }
    var albums = 'http://vimeo.com/api/v2/capecodchurch/albums.json';
    $.getJSON( albums, function( data ) {
        
      //if we are on the Watch page, then load the current series
      if( !is_previous_series_page ){
         var current = $(data).first()[0].id;
         loadSeries( current, false);
         return false;
      }  
        
      var count = 0;
      //add the message series that should always show
      $.merge( data, series );
      $( "<ul/>", {
          "id": "series-list",
        "class": "series-list"
      }).appendTo( '#video-content' );
        
      $.each( data, function( key, val ) {

          count++;

          var id = val.id;
          var title = val.title;
          var desc = val.description.replace(/(<([^>]+)>)/ig,"");
          var thumb = val.thumbnail_medium;
          var total = val.total_videos;
          var url = val.url;
          var updated = val.last_modified;
          
          if( desc.length && desc.length > 0 ){
              desc = desc + " ";   
          }
          
          var title_link_id = "series-title-link-" + id;
          var title_div_id = "series-title-div-" + id;
          var thumb_div_id = "series-thumb-div-" + id;
          var li_id = "#" + id;
          $( "<li/>", { "id": id, "class": "series" }).appendTo('#series-list')
              .append(
                  $( "<div/>", { "id": thumb_div_id, "class": "series-thumb" }).append(
                      $( "<a/>", { "href": "#series-" + id, "class": "series-link" })
                      .append(
                          $( "<img/>", { "src": thumb, "width": "295", "height": "166", "class": "series-thumb" } )
                      ).click( function(){
                          loadSeries($(this).closest("li").attr("id"), false);
                      })
                  )
              ).append( 
                  $( "<div/>", { "id": title_div_id, "class": "series-title" }).append(
                      $( "<a/>", { "href": "#series-" + id, "class": "series-link", html: title })
                          .click( function(){
                               loadSeries($(this).closest("li").attr("id"), false);
                          })
                  )
              ).append(
                  $( "<div/>", {"class": "series-description", html: desc + "<em>" + formatDate(updated) + "</em>" })
              );
      });
    });
    
    // show CCC Vimeo stats;
    $vimeo_stats = $( "#vimeo-stats" );
    if( $vimeo_stats.length ){
        var vimeoURL = "http://vimeo.com/api/v2/capecodchurch/info.json";
        $.getJSON( vimeoURL, function( data ){
            var vimeo_info = "<p id='vimeo-stats-p'>" + data.total_albums + " Message Series<br/>" 
                + data.total_videos_uploaded + " videos<br/>"
                + data.total_contacts + " followers</p>";
            $( "<div/>", {"id": "vimeo-info", html: vimeo_info }).appendTo( "#vimeo-stats" );
        });
    }
}

function setPageTitle(title){
  $(document).prop("title", title + " | Watch | Cape Cod Church");   
}

function formatDate(time){
    var date = new Date((time || "").replace(/-/g,"/").replace(/[TZ]/g," ")),
        diff = (((new Date()).getTime() - date.getTime()) / 1000),
        day_diff = Math.floor(diff / 86400),
        month_diff = Math.floor(day_diff / 30),
        year_diff = Math.floor(month_diff / 12);
            
    if ( isNaN(day_diff) || day_diff < 0 )
        return "";
            
    return day_diff == 0 && (
            diff < 60 && "just now" ||
            diff < 120 && "1 minute ago" ||
            diff < 3600 && Math.floor( diff / 60 ) + " minutes ago" ||
            diff < 7200 && "1 hour ago" ||
            diff < 86400 && Math.floor( diff / 3600 ) + " hours ago") ||
        day_diff == 1 && "Yesterday" ||
        day_diff < 7 && day_diff + " days ago" ||
        day_diff < 31 && Math.ceil( day_diff / 7 ) + " weeks ago" ||
        month_diff <= 1 && "1 month ago" ||
        month_diff < 12  && month_diff + " months ago" ||
        year_diff == 1 && "1 year ago" ||
        year_diff + " years ago";
}