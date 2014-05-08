// Custom playlist module
// Version 1.1.0
//
// Copyright (c) 2014 Tom v.d. Leij <contact@leijlandia.nl>
// Licensed under MIT.
//
// This script is made for personal use but can be used by others for their projects or as inspiration.
//
// Special thanks to Jacky Koning.

jQuery(document).ready(function () {

    $(function () {
        $('video, audio').mediaelementplayer({
            success: function (mediaElement, domObject) {
                mediaElement.addEventListener('ended', function (e) {
                    mejsPlayNext(e.target);
                }, false);
            },
            keyActions: [],
            features: ['current', 'progress', 'duration', 'tracks'],
            audioWidth: 560,
            audioHeight: 20
        });
        var keyup = true;
        $(document).keydown(function (e) {
            switch (e.which) {

                case 32:
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
                    $('#prev').click();
                    break;

                case 39:
                    $('#next').click();
                    break;

                default:
                    return; // exit this handler for other keys
            }
            e.preventDefault(); // prevent the default action (scroll / move caret)
        });
    });

    $.ajax('musicserver/playlists/playlist.txt', {
        dataType: 'text',
        success: function (data) {
            $('#playlist').html(data.replace(/[\\]/g, "/").replace(/[\#]/g, "%23"));
            dataoffile();
            firstplay();

            $('.mejs-list li').dblclick(function () {
                $(this).addClass('current').siblings().removeClass('current');
                var audio_src = $(this).attr('url');
                $('audio#mejs:first').each(function () {
                    stopAudio();
                    if ($('#mejs').attr('src') !== audio_src) {
                        this.setSrc(audio_src);
                    }
                    playAudio();
                    metadata();
                });
            });
        }
    });

    $('#play').click(function () {

        if ($(this).find('.visible')) {
            playAudio();
        } else {}
    });

    $('#pause').click(function () {

        if ($(this).find('.visible')) {
            stopAudio();
        } else {}
    });

    $('#prev').click(function () {
        var current_item = $('.mejs-list li.current:last'); // :last is added if we have few .current classes
        var audio_src = $(current_item).prev().attr('url');
        var type = $(current_item).prev().attr('audiotype');

        if ($('.mejs-list li.current').length > 0) { // get the .current song
            $(current_item).prev().addClass('current').siblings().removeClass('current');
            console.log('if ' + audio_src);
        }

        if ($(current_item).is(':first-child')) { // if it is last - stop playing
        } else {
            $('audio#mejs:first').each(function () {
                stopAudio();
                if ($('#mejs').attr('src') !== audio_src) {
                    this.setSrc(audio_src);
                }
                playAudio();
                metadata();
                csbscroll();
            });
        }



    });

    $('#next').click(function () {
        var current_item = $('.mejs-list li.current:first'); // :first is added if we have few .current classes
        var audio_src = $(current_item).next().attr('url');
        var type = $(current_item).next().attr('audiotype');

        if ($('.mejs-list li.current').length > 0) { // get the .current song
            $(current_item).next().addClass('current').siblings().removeClass('current');
            console.log('if ' + audio_src);
        }

        if ($(current_item).is(':last-child')) { // if it is last - stop playing
        } else {
            $('audio#mejs:first').each(function () {
                stopAudio();
                if ($('#mejs').attr('src') !== audio_src) {
                    this.setSrc(audio_src);
                }
                playAudio();
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

    /////////////////////////////////////////////////////////////////////	FUNCTIES

    function dataoffile() {
        $(".track").each(function () {
            var title = $(this).find('.title').text();
            var album = $(this).find('.album').text();
            var artist = $(this).find('.creator').text();
            var location = $(this).find('.location').text();
            var albumart = $(this).find('.albumart').text();

            $('.mejs-list').append('<li url="' + location + '" artist="' + artist + '"><img src="' + albumart + '/front.jpg"' + 'onerror=' + '"this.src=' + "'musicserver/images/unknown_album.png'" + '" alt="' + album + '"><div class="title ellipsis"><span>' + decodeURIComponent(title) + '</span></div><div class="aa ellipsis"><span>' + artist + ' - ' + decodeURIComponent(album) + '</span></div></li>');

        });

    }

    function firstplay() {
        var first_child = '.mejs-list li:first-child';
        var audio_src = $(first_child).attr('url');

        $(first_child).addClass('current').siblings().removeClass('current');

        $('audio#mejs:first').each(function () {
            if ($('#mejs').attr('src') !== audio_src) {
                this.setSrc(audio_src);
            }
            metadata();
        });
    }

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
        var audio_src = $(current_item).next().attr('url');
        var type = $(current_item).next().attr('audiotype');

        if ($('.mejs-list li.current').length > 0) { // get the .current song
            $(current_item).next().addClass('current').siblings().removeClass('current');
            console.log('if ' + audio_src);
        }

        if ($(current_item).is(':last-child')) { // if it is last - stop playing
        } else {
            if ($('#mejs').attr('src') !== audio_src) {
                currentPlayer.setSrc(audio_src);
            }
            currentPlayer.play();
            metadata();
            csbscroll();
        }
    }

    function metadata() {
        var song = $('.mejs-list li.current');
        var title = song.find('.title').text();
        var cover = song.find('img').attr('src');
        var artist = song.attr('artist');
        var album = song.find('img').attr('alt');

        $('.title-player span').text(decodeURIComponent(title));

        $('.artist-album span').text(decodeURIComponent(artist) + ' - ' + decodeURIComponent(album));

        if ($(".cover img").attr('src') != cover) {
            $('.cover').html('<img src="' + cover + '"/>');
        }

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

    function csbscroll() {
        $('#side-tracks').mCustomScrollbar("scrollTo", ".current");
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
            html: 'Double click on a track to play<br>Press SPACE to pause/play<br>Press left/right key to play the previous/next song<br><br><b>Tip!:</b> you can customize your playlist by dragging the desired song to the desired location in your playlist.<br><br>'
            //text: 'Double click on a track to play'
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
                            if (e.type !== 'mouseover') {
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