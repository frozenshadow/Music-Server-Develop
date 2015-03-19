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
    $.ajaxSetup({
        cache: true
    });
    var audioPlayer = document.getElementsByTagName('audio')[0]; //get audio player
    
        $.getScript('playlists/playlist.json').done(function () {
            $.each(playlists, function (idx, obj) {
                if ($("#playlist-select option[value='" + obj.playlist + "']").length < 1) {
                    $('#playlist-select').append("<option value='" + obj.playlist + "'>" + obj.playlist + "</option>");
                }
            }); //add playlists variable to dropdown menu (can be found in playlist.json)
            JSONload();
            firstplay();
            $('.mejs-list li').click(function () {
                listclick(this);
            })
        });

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
        $('audio#mejs').attr('onerror', "createGrowl();"); // Prevent onerror to be able to return when there was an error
    	var currentTime = document.getElementsByTagName('audio')[0].currentTime
        if (currentTime >= 5) { //return to start instead of prev
        	reloadAudio()
        } else {
        	var current_item = $('.mejs-list li.current:last'); // :last is added if we have few .current classes
        	var audio = $(current_item).prev().attr('url');
        	var audio_src = audio + $(current_item).prev().attr('lowq') || audio + '.mp3';

        	if ($('.mejs-list li.current').length > 0) { // get the .current song
            	$(current_item).prev().addClass('current').siblings().removeClass('current');
        	}

        	if ($(current_item).is(':first-child')) { // if it is last - stop playing
        	} else {
            	$('audio#mejs:first').each(function () {
                	while ($('#mejs').attr('src') !== audio_src) {
                	audioPlayer.src = audio_src;
            	}
			if ($('#pause').attr('class') == 'visible') {
                    playAudio();
            } //keep play state.
                metadata();
            });
        }
		}
    });

    $('#next').click(function () {
        $('audio#mejs').attr('onerror', "$('#next').click();createGrowl();"); // recreate onerror
        var current_item = $('.mejs-list li.current:first'); // :first is added if we have few .current classes
        var audio = $(current_item).next().attr('url');
        var audio_src = audio + $(current_item).next().attr('lowq') || audio + '.mp3';

        if ($('.mejs-list li.current').length > 0) { // get the .current song
            $(current_item).next().addClass('current').siblings().removeClass('current');
        }

        if ($(current_item).is(':last-child')) { // if it is last - stop playing
        } else {
            $('audio#mejs:first').each(function () {
                while ($('#mejs').attr('src') !== audio_src) {
                audioPlayer.src = audio_src;
                }
		if ($('#pause').attr('class') == 'visible') {
                    playAudio();
                } //keep play state.
                metadata();
                //csbscroll(); //not working
            });
        }
    });

        $('#shuffle').click(function (e) {
            $.getScript('../js/jquery.shuffle.min.js').done(function () {
                $('.mejs-list').shuffle();
                $('.mejs-list li.current').insertBefore('.mejs-list li:first');
                //csbscroll();
            });
        });
    
            /////////////////////////////////////////////////////////////////////	FUNCTIONS

        function JSONload() {
            var playlistselect = $("#playlist-select").val();
            $(".mejs-list").empty();
            var objects = ["ID", "title", "artist", "album", "location", "albumart", "lowq", "highq"];
            $.each(musicserver[playlistselect], function (idx, obj) {
                if (obj.title === undefined || obj.artist === undefined || obj.album === undefined || obj.location === undefined || obj.albumart === undefined) {
                    $.each(objects, function (key, value) {
                        if (obj[value] !== undefined) {
                            key = value;
                            val = obj[value];
                        } else {
                            return;
                        }
                        $.each(getObjects(musicserver, key, val), function (idx, obj) {
                            if (obj.title === undefined || obj.artist === undefined || obj.album === undefined || obj.location === undefined || obj.albumart === undefined) {
                                return;
                            }
                            $('.mejs-list').append('<li class="current ui-btn ui-btn-icon-right ui-icon-carat-r" url="' + '../../../' + obj.location + '" artist="' + obj.artist + '" lowq="' + obj.lowq + '" highq="' + obj.highq + '"><img src="images/unknown_album.svg" data-src="' + '../../../' + obj.albumart + '" alt="' + obj.album + '"><div class="title ellipsis"><span>' + decodeURIComponent(obj.title) + '</span></div><div class="aa ellipsis"><span>' + obj.artist + ' - ' + decodeURIComponent(obj.album) + '</span></div></li>');
                        });
                    });
                } else {
                    $('.mejs-list').append('<li class="current ui-btn ui-btn-icon-right ui-icon-carat-r" url="' + '../../../' + obj.location + '" artist="' + obj.artist + '" lowq="' + obj.lowq + '" highq="' + obj.highq + '"><img src="images/unknown_album.svg" data-src="' + '../../../' + obj.albumart + '" alt="' + obj.album + '"><div class="title ellipsis"><span>' + decodeURIComponent(obj.title) + '</span></div><div class="aa ellipsis"><span>' + obj.artist + ' - ' + decodeURIComponent(obj.album) + '</span></div></li>');
                }
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

    function firstplay() {
        var first_child = '.mejs-list li:first-child';
        var audio = $(first_child).attr('url');
        var audio_src = audio + $(first_child).attr('lowq') || audio + '.mp3';

        $(first_child).addClass('current').siblings().removeClass('current');

        $('audio#mejs:first').each(function () {
            while ($('#mejs').attr('src') !== audio_src) {
                audioPlayer.src = audio_src;
            }
            metadata();
        });
    }

    function playAudio() {
        $('audio#mejs:first').each(function () {
            audioPlayer.play();
        });
    }

    function stopAudio() {
        $('audio#mejs:first').each(function () {
            audioPlayer.pause();
        });
    }

    function mejsPlayNext(currentPlayer) {
        $('audio#mejs').attr('onerror', "$('#next').click();createGrowl();"); // recreate onerror
        var current_item = $('.mejs-list li.current:first'); // :first is added if we have few .current classes
        var audio = $(current_item).next().attr('url') + '.mp3';
        var audio_src = audio + $(current_item).next().attr('lowq') || audio + '.mp3';

        if ($('.mejs-list li.current').length > 0) { // get the .current song
            $(current_item).next().addClass('current').siblings().removeClass('current');
        }

        if ($(current_item).is(':last-child')) { // if it is last - stop playing
        } else {
            while ($('#mejs').attr('src') !== audio_src) {
                audioPlayer.src = audio_src;
            }
            currentPlayer.play();
            metadata();
        }
    }

    function metadata() {
        $("img").unveil(500);
        var song = $('.mejs-list li.current');
        var title = song.find('.title').text();
        //var cover = song.find('img').attr('src');
        var artist = song.attr('artist');
        var album = song.find('img').attr('alt');

        $('.title-player span').text(decodeURIComponent(title));

        $('.artist-album span').text(decodeURIComponent(artist) + ' - ' + decodeURIComponent(album));

        //if ($(".cover img").attr('src') != cover) {
        //    $('.cover').html('<img src="' + cover + '"/>');
        //}

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
        function listclick(that) {
            $(that).addClass('current').siblings().removeClass('current');
            var audio = $(that).attr('url');
            var audio_src = audio + $(that).attr('lowq') || audio + '.mp3';

            $('audio#mejs').attr('onerror', "$('#next').click();createGrowl();"); // recreate onerror

            $('audio#mejs:first').each(function () {
                if ($('#mejs').attr('src') !== audio_src) {
                    audioPlayer.src = audio_src;
                }
                playAudio();
                metadata();
            });
        } //click on the playlist will cause the number to change this is the function for that.
        
        function reloadAudio() { //reload audio
            var current_item = $('.mejs-list li.current');
            var audio = $(current_item).attr('url');
        	var audio_src = audio + $(current_item).attr('lowq') || audio + '.mp3';

            $('audio#mejs:first').each(function () {
                audioPlayer.src = 'reload';
                audioPlayer.src = audio_src;
                if ($('#pause').attr('class') == 'visible') {
                    playAudio();
                } //keep play state.
                metadata();
            });
        }

        var qtip_locationjs = ['../qtip/jquery.qtip.min.js', '../qtip/imagesloaded.pkg.min.js'];
        var qtip_locationcss = "../qtip/jquery.qtip.css";
        // How to use Music Server popup
        function dialogue(content, title) {
            $.getScript(qtip_locationjs[1], $.getScript(qtip_locationjs[0]), $.getCSS(qtip_locationcss)).done(function () {
                console.log('1');
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
            });
        }
        window.Alert = function () {
            //$.getScript(qtip_locationjs[1], $.getScript(qtip_locationjs[0]), $.getCSS(qtip_locationcss)).done(function () {
            console.log('2');
            var message = $('<span />', {
                html: 'Double click on a track to play<br>Press SPACE to play/pause<br>Press ESCAPE to stop playing<br>Press left/right key to play the previous/next song<br><br><b>Tip!:</b> you can customize your playlist by dragging the desired song to the desired location in your playlist.<br><br>'
            }),
                ok = $('<button />', {
                    text: 'Thank you!',
                        'class': 'full'
                });

            dialogue(message.add(ok), 'How to use Music Server:');
            //});
        };


        // Error popup
        window.createGrowl = function (persistent) {
            $.getScript(qtip_locationjs[1], $.getScript(qtip_locationjs[0]), $.getCSS(qtip_locationcss)).done(function () {
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
            });
        };
  (function () {
        var getCSS = function (attributes) {
            // setting default attributes
            if (typeof attributes === "string") {
                var href = attributes;
                attributes = {
                    href: href
                };
            }
            if (!attributes.rel) {
                attributes.rel = "stylesheet";
            }
            // appending the stylesheet
            // no jQuery stuff here, just plain dom manipulations
            var styleSheet = document.createElement("link");
            for (var key in attributes) {
                styleSheet.setAttribute(key, attributes[key]);
            }
            var head = document.getElementsByTagName("head")[0];
            head.appendChild(styleSheet);
        };

        if (typeof jQuery === "undefined") {
            window.getCSS = getCSS;
        } else {
            jQuery.getCSS = getCSS;
        }

    })();
});
