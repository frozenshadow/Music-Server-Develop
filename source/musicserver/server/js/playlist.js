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

        $("#playlist-select").change(function () {
			stopAudio();
            JSONload();
            firstplay();
			
			// Double click on desired track, why not working if outside change only??
				$('.mejs-list li').dblclick(function () {
				$(this).addClass('current').siblings().removeClass('current');
				var audio = $(this).attr('url');
	
				$('audio#mejs').attr('onerror', "$('#next').click();createGrowl();"); // recreate onerror
				if ($("#quality").attr('class') == "high") {
					audio_src = audio + $(this).attr('highq');
				} else {
					audio_src = audio + $(this).attr('lowq');
				} //low/high quality setting
	
				$('audio#mejs:first').each(function () {
					if ($('#mejs').attr('src') !== audio_src) {
						this.setSrc(audio_src);
					}
					playAudio();
					metadata();
				});
			});
        });


        $('.mejs-list li').dblclick(function () {
            $(this).addClass('current').siblings().removeClass('current');
            var audio = $(this).attr('url');

            $('audio#mejs').attr('onerror', "$('#next').click();createGrowl();"); // recreate onerror
            if ($("#quality").attr('class') == "high") {
                audio_src = audio + $(this).attr('highq');
            } else {
                audio_src = audio + $(this).attr('lowq');
            } //low/high quality setting

            $('audio#mejs:first').each(function () {
                if ($('#mejs').attr('src') !== audio_src) {
                    this.setSrc(audio_src);
                }
                playAudio();
                metadata();
            });
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
            var type = $(current_item).prev().attr('audiotype');

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
            var type = $(current_item).next().attr('audiotype');

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

            $(".mejs-list").empty();

            $.each(musicserver[playlistselect], function (idx, obj) {

                var title = obj.title;
                var album = obj.album;
                var artist = obj.creator;
                var location = obj.location;
                var albumart = obj.albumart;
                var lowq = obj.lowq;
                var highq = obj.highq;

                $('.mejs-list').append('<li url="' + location + '" artist="' + artist + '" lowq="' + lowq + '" highq="' + highq + '"><img src="musicserver/server/images/unknown_album.svg"' + 'data-src="' + albumart + '" onerror=' + '"this.src=' + "'musicserver/server/images/unknown_album.svg'" + '" alt="' + album + '"><div class="title ellipsis"><span>' + decodeURIComponent(title) + '</span></div><div class="aa ellipsis"><span>' + artist + ' - ' + decodeURIComponent(album) + '</span></div></li>');
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
            var type = $(current_item).next().attr('audiotype');

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
            var title = song.find('.title').text();
            var artist = song.attr('artist');
            var album = song.find('img').attr('alt');
            var cover = song.find('img').attr('src');
            var cover2 = $(".cover img").attr('src');
            cover = cover + '" onerror="this.src=\'musicserver/server/images/unknown_album.svg\'"';
            cover2 = cover2 + '" onerror="this.src=\'musicserver/server/images/unknown_album.svg\'"';

            $('.title-player span').text(decodeURIComponent(title));
            $('.artist-album span').text(decodeURIComponent(artist) + ' - ' + decodeURIComponent(album));

            if (cover2 != cover) {
                $('.cover').html('<img src="' + cover + '/>');
            }

            if ($("#artist img").attr('src') != 'music/' + artist + '/artist.jpg') {
                $('#artist').html('<img src="music/' + artist + '/artist.jpg"/>');
            } //sets artist cover if #artist is in the html

            $('#download').attr('title', 'Download "' + title + '"');

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

}(jQuery));