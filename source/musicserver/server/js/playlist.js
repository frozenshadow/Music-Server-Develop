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
    $(window).load(function () {
        var c = 0;
        $("#side-tracks").mCustomScrollbar({
            scrollInertia: 500,
            callbacks: {
                onScroll: function () {
                    $("img").unveil(1000);
                },
                whileScrolling: function () {
                    c = c + 1;
                    if (c == "25") {
                        $("img").unveil(1000);
                        c = 0;
                    }
                }
            }
        });
        $(".mejs-list").sortable({
            scroll: false,
            axis: "y",
            change: function (event, ui) {
                var p = ui.position.top,
                    h = ui.helper.outerHeight(true),
                    s = ui.placeholder.position().top,
                    elem = $("#side-tracks .mCustomScrollBox")[0],
                    elemHeight = $("#side-tracks .mCustomScrollBox").height();
                pos = findPos(elem),
                mouseCoordsY = event.pageY - pos[0];
                if (mouseCoordsY < h || mouseCoordsY > elemHeight - h) {
                    $("#side-tracks").mCustomScrollbar("scrollTo", p - (elemHeight / 2));
                }
            }
        });

        function findPos(obj) {
            var curleft = curtop || 0;
            if (obj.offsetParent) {
                curleft = obj.offsetLeft;
                curtop = obj.offsetTop;
                while (obj == obj.offsetParent) {
                    curleft += obj.offsetLeft;
                    curtop += obj.offsetTop;
                }
            }
            return [curtop, curleft];
        }
    });
})(jQuery);

(function ($) {
    $.ajaxSetup({
        cache: true
    });

    $.fn.MusicServer = function (options) {

        var settings = $.extend({
            //option: 'value' // Placeholder DO NOT DELETE!


        }, options);
    };

    jQuery(document).ready(function () {
        //pre variables
        var player = AV.Player;
        var audioPlayer = player.fromURL('http://eclassical.com/custom/eclassical/files/BIS1536-001-flac_16.flac'); //get audio player
        var volume = audioPlayer.volume;

        //get positions of object to be able to move them.
        var timehandle = $('.railhandle').position().left;
        var volumehandle = $('.volumehandle').position().top;
        var volumeoffset = $('.volumehandle').offset().top;
        var timeoffset = $('.railhandle').offset().left;
        var audiowidth = $('.bottomrail').width() || 450; //use css if set otherwise use value
        var volumeheight = $('.maxvolume').height() || 70; //use css if set otherwise use value

        //run once
        $('.bottomrail').width(audiowidth);
        $('.maxvolume').height(volumeheight);
        $('.currentvolume').height(volumeheight);


        var t = setInterval(updateUI, 100);

        function updateUI() {
            updatetime();
            buffered();
            if ($('.maxtime').html() === "00:00" && $('#pause').attr('class') !== 'visible') {
                audioPlayer.play();
                audioPlayer.pause();
            }
        }

        function buffered() {
            var percent = audioPlayer.buffered;
            var d = (percent / 100) * audiowidth;
            $('.bottomrailprogres').width(d.toFixed(0));
        }

        //functions
        function updatetime() {
            var a = audioPlayer.currentTime / audioPlayer.duration * audiowidth;
            $('.currentrail').width(a);
            if (a === audiowidth) {
                $('#next').click();
            }
            $('.railhandle').css('left', a + timehandle);
            $('.bottomrail').width(audiowidth);
            var d = audioPlayer.currentTime / 1000 || 0;
            var e = Math.floor(d / 60) || 0;
            var f = Math.floor(d - (e * 60)) || 0;
            $('.currenttime').html(('0' + e).slice(-2) + ':' + ('0' + f).slice(-2));

            var g = audioPlayer.duration / 1000 || 0;
            var b = Math.floor(g / 60) || 0;
            var c = Math.floor(g - (b * 60)) || 0;
            $('.maxtime').html(('0' + b).slice(-2) + ':' + ('0' + c).slice(-2));
        }

        function setAudiosrc(src) {
            if (audioPlayer.asset.source.url !== src) {
                audioPlayer.pause();
                audioPlayer = player.fromURL(src);
            }
        }

        function setvolume(a) {
            var b = document.getElementById("mute");
            if (a >= 1) {
                audioPlayer.volume = 100;
                a = 1;
            }
            if (a <= 0) {
                audioPlayer.volume = 0;
                b.className = "muted";
                a = 0;
            } else {
                b.className = "mute";
            }
            audioPlayer.volume = a * 100;
            $('.currentvolume').height(a * volumeheight);
            $('.volumehandle').css('top', volumeheight - a * volumeheight);
        }

        $(window).resize(function () { // offsets change when window gets a different size... so when that happens redo offsets
            volumeoffset = $('.volumehandle').offset().top - ($('.volumehandle').position().top - volumehandle);
            timeoffset = $('.railhandle').offset().left - ($('.railhandle').position().left - timehandle);
        }); //get new value's not cached ones.

        var mousedown = false;
        var volumemouse = false;
        $('.maxvolume').mousedown(function (e) {
            var a = $(this).offset();
            var b = e.pageY - a.top;
            var c = (volumeheight - b) / volumeheight;
            setvolume(c);
            volumemouse = true;
        });

        $(".bottomrail").mousedown(function (e) {
            var a = $(this).offset();
            var b = e.pageX - a.left;
            var c = (b) / audiowidth;
            updaterail(c);
            mousedown = true;
        });

        $(window).mousemove(function (e) {
            if (mousedown === true) {
                updaterail((e.pageX - timeoffset + parseInt($('.railhandle').css('margin-left'), 10)) / audiowidth);
                updatetime();
            }
            if (volumemouse === true) {
                setvolume((volumeheight - (e.pageY - volumeoffset + parseInt($('.volumehandle').css('margin-top'), 10))) / volumeheight);
            }
        });

        $(window).mouseup(function (e) { //stop movement
            mousedown = false;
            volumemouse = false;
        });

        function updaterail(a) { //time rail updater
            try {
                audioPlayer.seek((audioPlayer.duration * a).toFixed(0));
            } catch (e) {} //catch errors from undefined
        }

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
                    if (audioPlayer.playing !== false) {
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

                case 38:
                    volume = ((Math.floor(audioPlayer.volume, 1) + 5) / 100);
                    setvolume(volume);
                    break;

                case 39:
                    //right arrow: play next item
                    $('#next').click();
                    break;

                case 40:
                    volume = ((Math.floor(audioPlayer.volume, 1) - 5) / 100);
                    setvolume(volume);
                    break;

                default:
                    return; // exit this handler for other keys
            }
            e.preventDefault(); // prevent the default action (scroll / move caret)
        });

        $.getScript('musicserver/playlists/playlist.json').done(function () {
            $.each(playlists, function (idx, obj) {
                if ($("#playlist-select option[value='" + obj.playlist + "']").length < 1) {
                    $('#playlist-select').append("<option value='" + obj.playlist + "'>" + obj.playlist + "</option>");
                }
            }); //add playlists variable to dropdown menu (can be found in playlist.json)
            JSONload();
            firstplay();
        });

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
                    setAudiosrc(audio_src);
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
                    setAudiosrc(audio_src);
                    if ($('#pause').attr('class') == 'visible') {
                        playAudio();
                    } //keep play state.
                    metadata();
                    csbscroll();
                });
            }
        });

        $('#mute').click(function () { //mute button
            var a = document.getElementById("mute");
            var b = a.className;
            if (b == "muted") {
                a.className = "mute";
                audioPlayer.muted = false;
            } else {
                a.className = "muted";
                audioPlayer.muted = true;
            }
        });

        $('#shuffle').click(function (e) {
            $.getScript('musicserver/server/js/jquery.shuffle.min.js').done(function () {
                $('.mejs-list').shuffle();
                $('.mejs-list li.current').insertBefore('.mejs-list li:first');
                csbscroll();
            });
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
            $("#side-tracks").mCustomScrollbar("update");
            var objects = ["ID", "title", "artist", "album", "location", "albumart", "lowq", "highq"];
            $.each(musicserver[playlistselect], function (idx, obj) {
                if (obj.title === undefined || obj.artist === undefined || obj.album === undefined || obj.location === undefined || obj.albumart === undefined || obj.lowq === undefined || obj.highq === undefined) {
                    $.each(objects, function (key, value) {
                        if (obj[value] !== undefined) {
                            key = value;
                            val = obj[value];
                        } else {
                            return;
                        }
                        $.each(getObjects(musicserver, key, val), function (idx, obj) {
                            if (obj.title === undefined || obj.artist === undefined || obj.album === undefined || obj.location === undefined || obj.albumart === undefined || obj.lowq === undefined || obj.highq === undefined) {
                                return;
                            }
                            $('.mejs-list').append('<li url="' + obj.location + '" artist="' + obj.artist + '" lowq="' + obj.lowq + '" highq="' + obj.highq + '"><img src="musicserver/server/images/unknown_album.svg"' + 'data-src="' + obj.albumart + '" onerror=' + '"this.src=' + "'musicserver/server/images/unknown_album.svg'" + '" alt="' + obj.album + '"><div class="title ellipsis"><span>' + decodeURIComponent(obj.title) + '</span></div><div class="aa ellipsis"><span>' + obj.artist + ' - ' + decodeURIComponent(obj.album) + '</span></div></li>');
                        });
                    });
                } else {
                    $('.mejs-list').append('<li url="' + obj.location + '" artist="' + obj.artist + '" lowq="' + obj.lowq + '" highq="' + obj.highq + '"><img src="musicserver/server/images/unknown_album.svg"' + 'data-src="' + obj.albumart + '" onerror=' + '"this.src=' + "'musicserver/server/images/unknown_album.svg'" + '" alt="' + obj.album + '"><div class="title ellipsis"><span>' + decodeURIComponent(obj.title) + '</span></div><div class="aa ellipsis"><span>' + obj.artist + ' - ' + decodeURIComponent(obj.album) + '</span></div></li>');
                }
            });
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
                    setAudiosrc(audio_src);
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
                audioPlayer.play();
            });

            $('#play').addClass('hidden');
            $('#pause').addClass('visible');
        }

        function stopAudio() {
            $('audio#mejs:first').each(function () {
                audioPlayer.pause();
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
                    setAudiosrc(audio_src);
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
            var cover = song.find('img').attr('data-src') + '" onerror="this.src=\'musicserver/server/images/unknown_album.svg\'"';
            var cover2 = $(".cover img").attr('src') + '" onerror="this.src=\'musicserver/server/images/unknown_album.svg\'"';

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
                setAudiosrc(audio_src);
                playAudio();
                metadata();
            });
        } //dblclick on the playlist will cause the number to change this is the function for that.

        function csbscroll() {
            try {
                $("#side-tracks").mCustomScrollbar("scrollTo", ".current");
            } catch (e) {}
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
                setAudiosrc('stop');
                setAudiosrc(audio_src);
                if ($('#pause').attr('class') == 'visible') {
                    playAudio();
                } //keep play state.
                metadata();
            });
        }

        var qtip_locationjs = ['musicserver/server/qtip/jquery.qtip.min.js', 'musicserver/server/qtip/imagesloaded.pkg.min.js'];
        var qtip_locationcss = "musicserver/server/qtip/jquery.qtip.css";
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
    });
    (function () {
        /*
		arguments: attributes
		attributes can be a string: then it goes directly inside the href attribute.
		e.g.: $.getCSS("fresh.css")

		attributes can also be an objcet.
		e.g.: $.getCSS({href:"cool.css", media:"print"})
		or:	$.getCSS({href:"/styles/forest.css", media:"screen"})
	*/
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
}(jQuery));