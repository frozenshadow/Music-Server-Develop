// Custom playlist module
// Version 1.1.0
//
// Copyright (c) 2014 Tom v.d. Leij <contact@leijlandia.nl>
// Licensed under MIT.
//
// This script is made for personal use but can be used by others for their projects or as inspiration.
//
// Special thanks to Jacky Koning.

(function ($) {

    $.fn.MusicServer = function (options) {

        var settings = $.extend({
            //option: 'value' // Placeholder DO NOT DELETE!
        }, options);
    };

    jQuery(document).ready(function () {

        $(function () {
            $('video, audio').mediaelementplayer({
                success: function (mediaElement, domObject) {
                    mediaElement.addEventListener('ended', function (e) {
                        mejsPlayNext(e.target);
                    }, false);
                },
                keyActions: [],
                features: ['current', 'progress', 'duration', 'tracks', 'volume'],
                audioWidth: 534,
                audioHeight: 20
            });

            //keyboard shortcuts
            var keyup = true; //prevents spamming play/pause
            $(document).keydown(function (e) {
                switch (e.which) {

                    case 27:
                        //escape: stop audio
                        stopAudio();
                        break;

                    case 32:
                        //spacebar: start/stop audio
                        if (!keyup) return;
                        keyup = false;
                        if ($('#pause').attr('class') == 'visible') {
                            stopAudio();
                        } else {
                            playAudio();
                        }
                        $(document).keyup(function (e) {
                            if (e.keyCode == '32') {
                                keyup = true;
                            }
                        });
                        break;

                    case 37:
                        //left arrow: play previous item
                        $('#prev').click();
                        break;

                    case 39:
                        //right arrow: play next item
                        $('#next').click();
                        break;

                    default:
                        return; // exit this handler for other keys
                }
                e.preventDefault(); // prevent the default action (scroll / move caret)
            });
        });

        JSONload();
        firstplay();

        // load settings (experimental) NOG EVEN LATEN STAAN AUB
        /* $.ajax('musicserver/settings.txt', {
        dataType: 'text',
        success: function (data) {
            $('#content').html(data);
        }
    });*/


        $.each(playlists, function (idx, obj) {
            if ($("#playlist-select option[value='" + obj.playlist + "']").length < 1) {
                $('#playlist-select').append("<option value='" + obj.playlist + "'>" + obj.playlist + "</option>");
            }
        }); //add playlists variable to dropdown menu (can be found in playlist.json)

        $("#playlist-select").change(function () {
            stopAudio();
            JSONload();
            firstplay();
            reloadAudio();

            $('.mejs-list li').dblclick(function () {
                var clicked = $(this).addClass('current').siblings().removeClass('current');
                var audio = $(this).attr('url');
                listdblclick(clicked, audio);
            });
        });

        $('.mejs-list li').dblclick(function () {
            var clicked = $(this).addClass('current').siblings().removeClass('current');
            var audio = $(this).attr('url');
            listdblclick(clicked, audio);
        });

        //buttons
        $('#play').click(function () {

            if ($(this).find('.visible')) {
                playAudio();
            }
        });

        $('#pause').click(function () {

            if ($(this).find('.visible')) {
                stopAudio();
            }
        });

        $('#prev').click(function () {
            var current_item = $('.mejs-list li.current:last'); // :last is added if we have few .current classes
            var audio = $(current_item).prev().attr('url');

            $('audio#mejs').attr('onerror', "createGrowl();"); // Prevent onerror
            if ($("#quality").attr('class') == "high") {
                audio_src = audio + $(current_item).prev().attr('highq');
            } else {
                audio_src = audio + $(current_item).prev().attr('lowq');
            } //low/high quality setting

            if ($('.mejs-list li.current').length > 0) { // get the .current song
                $(current_item).prev().addClass('current').siblings().removeClass('current');
            }

            if ($(current_item).is(':first-child')) { // if it is last - stop playing
            } else {
                $('audio#mejs:first').each(function () {
                    if ($('#mejs').attr('src') != audio_src) {
                        this.setSrc(audio_src);
                    }
                    if ($('#pause').attr('class') == 'visible') {
                        playAudio();
                    } //keep play state.
                    metadata();
                    csbscroll();
                });
            }
        });

        $('#next').click(function () {
            var current_item = $('.mejs-list li.current:first'); // :first is added if we have few .current classes
            var audio = $(current_item).next().attr('url');

            $('audio#mejs').attr('onerror', "$('#next').click();createGrowl();"); // recreate onerror
            if ($("#quality").attr('class') == "high") {
                audio_src = audio + $(current_item).next().attr('highq');
            } else {
                audio_src = audio + $(current_item).next().attr('lowq');
            } //low/high quality setting

            if ($('.mejs-list li.current').length > 0) { // get the .current song
                $(current_item).next().addClass('current').siblings().removeClass('current');
            }

            if ($(current_item).is(':last-child')) { // if it is last - stop playing
                stopAudio();
            } else {
                $('audio#mejs:first').each(function () {
                    if ($('#mejs').attr('src') != audio_src) {
                        this.setSrc(audio_src);
                    }
                    if ($('#pause').attr('class') == 'visible') {
                        playAudio();
                    } //keep play state.
                    metadata();
                    csbscroll();
                });
            }
        });

        $('#shuffle').click(function (e) {
            $('.mejs-list').shuffle();
            $('.mejs-list li.current').insertBefore('.mejs-list li:first');
            csbscroll();
        });

        $("#download").click(function () {
            window.open($('audio#mejs').attr('src'));
        }); //make sure the MIME type for the file is set to "application/octet-stream"

        $("#lock").click(function () {
            if ($(".mejs-list").hasClass("ui-sortable-disabled")) {
                $(".mejs-list").sortable("enable");
                $('#lock').attr('title', 'Lock the playlist');
            } else {
                $(".mejs-list").sortable("disable");
                $('#lock').attr('title', 'Unlock the playlist');
            }
            $(this).toggleClass("locked");
        });

        $('#quality').click(function () {
            if ($(this).attr('class') == 'high') {
                $(this).removeClass('high');
                $(this).addClass('low');
                $(this).attr('title', 'Set music quality to high');
            } else {
                $(this).removeClass('low');
                $(this).addClass('high');
                $(this).attr('title', 'Set music quality to low');
            } //low/high quality setting
            reloadAudio();
        });

        /////////////////////////////////////////////////////////////////////	FUNCTIONS

        function JSONload() {
            var playlistselect = $("#playlist-select").val();

            $(".mejs-list").empty(); //clean list before (re)adding

            $.each(musicserver[playlistselect], function (idx, obj) {
                if (obj.title === undefined || obj.artist === undefined || obj.album === undefined || obj.location === undefined || obj.albumart === undefined || obj.lowq === undefined || obj.highq === undefined) {
                    //since 1 or more object detail(s) is/are missing look it up in the main table.
                    if (obj.ID !== undefined) {
                        key = 'ID';
                        val = obj.ID;
                    } else if (obj.location !== undefined) {
                        key = 'location';
                        val = obj.location;
                    } else if (obj.title !== undefined) {
                        key = 'title';
                        val = obj.title;
                    } else if (obj.album !== undefined) {
                        key = 'album';
                        val = obj.album;
                    } else if (obj.artist !== undefined) {
                        key = 'artist';
                        val = obj.artist;
                    } else if (obj.lowq !== undefined) {
                        key = 'lowq';
                        val = obj.lowq;
                    } else if (obj.highq !== undefined) {
                        key = 'highq';
                        val = obj.highq;
                    } else {
                        console.log('invalid object found in playlist: ' + playlistselect);
                        return;
                    }
                    $.each(getObjects(musicserver, key, val), function (idx, obj) { //search with valid a value in the main table.
                        //if any of these value's is/are still undefined ignore the entire object
                        if (obj.title === undefined || obj.artist === undefined || obj.album === undefined || obj.location === undefined || obj.albumart === undefined || obj.lowq === undefined || obj.highq === undefined) {
                            return;
                        }
                        $('.mejs-list').append('<li url="' + obj.location + '" artist="' + obj.artist + '" lowq="' + obj.lowq + '" highq="' + obj.highq + '"><img src="build/images/unknown_album.svg"' + 'data-src="' + obj.albumart + '" onerror=' + '"this.src=' + "'build/images/unknown_album.svg'" + '" alt="' + obj.album + '"><div class="title ellipsis"><span>' + decodeURIComponent(obj.title) + '</span></div><div class="aa ellipsis"><span>' + obj.artist + ' - ' + decodeURIComponent(obj.album) + '</span></div></li>');
                    });
                } else {
                    //if we have all the object details why bother looking up the details just fill it in.
                    $('.mejs-list').append('<li url="' + obj.location + '" artist="' + obj.artist + '" lowq="' + obj.lowq + '" highq="' + obj.highq + '"><img src="build/images/unknown_album.svg"' + 'data-src="' + obj.albumart + '" onerror=' + '"this.src=' + "'build/images/unknown_album.svg'" + '" alt="' + obj.album + '"><div class="title ellipsis"><span>' + decodeURIComponent(obj.title) + '</span></div><div class="aa ellipsis"><span>' + obj.artist + ' - ' + decodeURIComponent(obj.album) + '</span></div></li>');
                }
            }); //Loads up playlistjs that has been defined in playlist.js
            $("#side-tracks").mCustomScrollbar("update");
        }

        function firstplay() {
            var first_child = '.mejs-list li:first-child';
            var audio = $(first_child).attr('url');
            if ($("#quality").attr('class') == "high") {
                audio_src = audio + $(first_child).attr('highq');
            } else {
                audio_src = audio + $(first_child).attr('lowq');
            } //low/high quality setting

            $(first_child).addClass('current').siblings().removeClass('current');

            $('audio#mejs:first').each(function () {
                if ($('#mejs').attr('src') != audio_src) {
                    $('#mejs').attr('src', audio_src); //dirty hack otherwise it wont work.
                }
                metadata();
            });
        }

        function getObjects(obj, key, val) {
            var objects = [];
            for (var i in obj) {
                if (!obj.hasOwnProperty(i)) continue;
                if (typeof obj[i] == 'object') {
                    objects = objects.concat(getObjects(obj[i], key, val));
                } else if (i == key && obj[key] == val) {
                    objects.push(obj);
                }
            }
            return objects;
        } //playlist search

        function playAudio() {
            $('audio#mejs:first').each(function () {
                this.play();
            });

            $('#play').addClass('hidden');
            $('#pause').addClass('visible');
        }

        function stopAudio() {
            $('audio#mejs:first').each(function () {
                this.pause();
            });

            $('#play').removeClass('hidden');
            $('#pause').removeClass('visible');
        }

        function mejsPlayNext(currentPlayer) {
            var current_item = $('.mejs-list li.current:first'); // :first is added if we have few .current classes
            var audio = $(current_item).next().attr('url');

            $('audio#mejs').attr('onerror', "$('#next').click();createGrowl();"); // recreate onerror
            if ($("#quality").attr('class') == "high") {
                audio_src = audio + $(current_item).next().attr('highq');
            } else {
                audio_src = audio + $(current_item).next().attr('lowq');
            } //low/high quality setting


            if ($('.mejs-list li.current').length > 0) { // get the .current song
                $(current_item).next().addClass('current').siblings().removeClass('current');
            }

            if ($(current_item).is(':last-child')) { // if it is last - stop playing
            } else {
                if ($('#mejs').attr('src') != audio_src) {
                    currentPlayer.setSrc(audio_src);
                }
                currentPlayer.play();
                metadata();
                csbscroll();
            }
        }

        // Metadata sets the player information.
        function metadata() {
            $("img").unveil(500);
            var song = $('.mejs-list li.current');
            var title = decodeURIComponent(song.find('.title').text());
            var artist = decodeURIComponent(song.attr('artist'));
            var album = decodeURIComponent(song.find('img').attr('alt'));
            var cover = song.find('img').attr('data-src') + '" onerror="this.src=\'build/images/unknown_album.svg\'"';
            var cover2 = $(".cover img").attr('src') + '" onerror="this.src=\'build/images/unknown_album.svg\'"';

            $('.title-player span').text(title);
            $('.artist-album span').text(artist + ' - ' + album);

            if (cover2 != cover) {
                $('.cover').html('<img src="' + cover + '/>');
            } //if cover image has not changed do not reload it. else load new image.

            if ($("#artist img").attr('src') != 'music/' + artist + '/artist.jpg') {
                $('#artist').html('<img src="music/' + artist + '/artist.jpg"/>');
            } //sets artist cover if #artist is in the html

            //$('title').html(title); //sets window title to the title of the current song

            $('#download').attr('title', 'Download "' + title + '"'); //sets info of the download button to the title of the current song

            $('#headertext span:last').remove();
            $('#headertext').append('<span>Now playing: ' + title + '</span>');

            (function () {
                var quotes = $("#headertext span");
                var quoteIndex = -1;

                function showNextQuote() {
                    ++quoteIndex;
                    quotes.eq(quoteIndex % quotes.length)
                        .fadeIn(2000)
                        .delay(2000)
                        .fadeOut(2000, showNextQuote);
                }

                showNextQuote();
            })();

        }

        function listdblclick(clicked, audio) {

            $('audio#mejs').attr('onerror', "$('#next').click();createGrowl();"); // recreate onerror
            if ($("#quality").attr('class') == "high") {
                audio_src = audio + $(clicked).attr('highq');
            } else {
                audio_src = audio + $(clicked).attr('lowq');
            } //low/high quality setting

            $('audio#mejs:first').each(function () {
                if ($('#mejs').attr('src') !== audio_src) {
                    this.setSrc(audio_src);
                }
                playAudio();
                metadata();
            });
        } //dblclick on the playlist will cause the number to change this is the function for that.

        function csbscroll() {
            $("#side-tracks").mCustomScrollbar("scrollTo", ".current");
        }

        function reloadAudio() { //reload audio
            var current_item = $('.mejs-list li.current');
            var audio = $(current_item).attr('url');

            if ($("#quality").attr('class') == "high") {
                audio_src = audio + $(current_item).attr('highq');
            } else {
                audio_src = audio + $(current_item).attr('lowq');
            } //low/high quality setting

            $('audio#mejs:first').each(function () {
                this.setSrc('reload');
                this.setSrc(audio_src);
                if ($('#pause').attr('class') == 'visible') {
                    playAudio();
                } //keep play state.
                metadata();
            });
        }

        // How to use Music Server popup
        function dialogue(content, title) {
            $('<div />').qtip({
                content: {
                    text: content,
                    title: title
                },
                position: {
                    my: 'center',
                    at: 'center',
                    target: $(window)
                },
                show: {
                    ready: true,
                    modal: {
                        on: true,
                        blur: false
                    }
                },
                hide: false,
                style: 'dialogue',
                events: {
                    render: function (event, api) {
                        $('button', api.elements.content).click(function (e) {
                            api.hide(e);
                        });
                    },
                    hide: function (event, api) {
                        api.destroy();
                    }
                }
            });
        }


        window.Alert = function () {
            var message = $('<span />', {
                html: 'Double click on a track to play<br>Press SPACE to play/pause<br>Press ESCAPE to stop playing<br>Press left/right key to play the previous/next song<br><br><b>Tip!:</b> you can customize your playlist by dragging the desired song to the desired location in your playlist.<br><br>'
            }),
                ok = $('<button />', {
                    text: 'Thank you!',
                        'class': 'full'
                });

            dialogue(message.add(ok), 'How to use Music Server:');
        };

        // Error popup
        window.createGrowl = function (persistent) {
            var target = $('.qtip.jgrowl:visible:last');

            $('<div/>').qtip({
                content: {
                    text: 'Please, check the source of the song!' + '<br>' + 'Moving on to the next song.',
                    title: {
                        text: 'Song could not be played!',
                        button: true
                    }
                },
                position: {
                    target: [0, 0],
                    container: $('#qtip-growl-container')
                },
                show: {
                    event: false,
                    ready: true,
                    effect: function () {
                        $(this).stop(0, 1).animate({
                            height: 'toggle'
                        }, 400, 'swing');
                    },
                    delay: 0,
                    persistent: persistent
                },
                hide: {
                    event: false,
                    effect: function (api) {
                        $(this).stop(0, 1).animate({
                            height: 'toggle'
                        }, 400, 'swing');
                    }
                },
                style: {
                    width: 250,
                    classes: 'jgrowl',
                    tip: false
                },
                events: {
                    render: function (event, api) {
                        if (!api.options.show.persistent) {
                            $(this).bind('mouseover mouseout', function (e) {
                                var lifespan = 5000;

                                clearTimeout(api.timer);
                                if (e.type != 'mouseover') {
                                    api.timer = setTimeout(function () {
                                        api.hide(e);
                                    }, lifespan);
                                }
                            })
                                .triggerHandler('mouseout');
                        }

                    }
                }
            });
        };

    });

    //$.getJSON( "musicserver/playlists/playlist.json", function( data ) {
    //  var items = [];
    //  $.each( data, function( key, val ) {
    //    items.push( "<li id='" + key + "'>" + val + "</li>" );
    // console.log(val)
    //  });
    //  $( "<ul/>", {
    //    "class": "my-new-list",
    //    html: items.join( "" )
    //  })
    //});

}(jQuery));