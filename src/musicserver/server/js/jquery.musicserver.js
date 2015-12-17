/*
 * Music Server core
 * Version: 1.1.0
 * Author: Tom van der Leij, Jacky Koning
 * http://musicserver.leijlandia.nl/
 *
 * Description:
 * This is the core script for Music Server.
 *
 * Copyright (c) 2014 Tom van der Leij <contact@leijlandia.nl>
 * Licensed under MIT
 *
 * Date: 19-8-2014
 */

(function ($) {
    $.ajaxSetup({
        cache: true
    });

    $.fn.MusicServer = function (options) {

        var settings = $.extend({
            shuffle_location: "musicserver/server/js/jquery.shuffle.min.js", // Location for Shuffle script
            qtip_location: ["musicserver/server/qtip/jquery.qtip.min.js", "musicserver/server/qtip/imagesloaded.pkg.min.js"], // Location for qTip script
            unveil_location: "musicserver/server/js/jquery.unveil.js", // Location for Unveil script
            mainindex_location: "", // Location of main index document
            mainimage_folder: "musicserver/server/images/",
            music_folder: "music"
        }, options);


        jQuery(document).ready(function () {

            $('video, audio').MusicPlayer();

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

        $.each(mssettings, function (idx, obj) {
            if (obj.layout != $('#layout-select option').text()) {
                $('#layout-select').append('<option value="musicserver/themes/' + obj.layout + '">' + obj.layout + '</option>');
            }
        }); //add layout variable to dropdown menu (can be found in settings.json)

        $.each(playlists, function (idx, obj) {
            $('#playlist-select').append("<option>" + obj.playlist + "</option>");
        }); //add playlists variable to dropdown menu (can be found in settings.json)

        $("#playlist-select").change(function () {
            stopAudio();
            JSONload();
            firstplay();
        });

        $(document).on('dblclick', '.mejs-list li', function () {
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
                        audioPlayer.src = audio_src;
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
                        audioPlayer.src = audio_src;
                    }
                    if ($('#pause').attr('class') == 'visible') {
                        playAudio();
                    } //keep play state.
                    metadata();
                    csbscroll();
                });
            }
        });

        $.getScript(settings.shuffle_location, function () {
            $('#shuffle').click(function (e) {
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

        $("#settings").click(function () {
            if (!$("#content").children(":visible:not(#config)").length == 0) {
                $("#content").children(":not(#config)").fadeOut("slow", function () {
                    $("#content, #config").fadeIn("slow");
                });
            } else if (!$("#content-wrap").children(":visible:not(#content)").length == 0) {
                $("#content-wrap").children(":visible:not(#content)").fadeOut("slow", function () {
                    $("#content, #config").fadeIn("slow");
                });
            } else {
                $("#content, #config").fadeOut("slow", function () {
                    $("#content-wrap").children(":not(#content)").fadeIn("slow");
                });
            };
        });

        $("#info").click(function () {
            if (!$("#content").children(":visible:not(#information)").length == 0) {
                $("#content").children(":not(#information)").fadeOut("slow", function () {
                    $("#content, #information").fadeIn("slow");
                });
            } else if (!$("#content-wrap").children(":visible:not(#content)").length == 0) {
                $("#content-wrap").children(":visible:not(#content)").fadeOut("slow", function () {
                    $("#content, #information").fadeIn("slow");
                });
            } else {
                $("#content, #information").fadeOut("slow", function () {
                    $("#content-wrap").children(":not(#content)").fadeIn("slow");
                });
            };
        });

        $("#more").click(function () {
            if (!$("#content").children(":visible:not(#more-options)").length == 0) {
                $("#content").children(":not(#more-options)").fadeOut("slow", function () {
                    $("#content, #more-options").fadeIn("slow");
                });
            } else if (!$("#content-wrap").children(":visible:not(#content)").length == 0) {
                $("#content-wrap").children(":visible:not(#content)").fadeOut("slow", function () {
                    $("#content, #more-options").fadeIn("slow");
                });
            } else {
                $("#content, #more-options").fadeOut("slow", function () {
                    $("#content-wrap").children(":not(#content)").fadeIn("slow");
                });
            };
        });

        // Scrollbar functions
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
            var curleft = curtop = 0;
            if (obj.offsetParent) {
                curleft = obj.offsetLeft;
                curtop = obj.offsetTop;
                while (obj = obj.offsetParent) {
                    curleft += obj.offsetLeft;
                    curtop += obj.offsetTop;
                }
            }
            return [curtop, curleft];
        }
		
		// Create cookie with user inputed server name
		$.cookie("servername", $('#servername-input').val(), { path: '/' });

        /////////////////////////////////////////////////////////////////////	FUNCTIONS

        function JSONload() {
            var playlistselect = $("#playlist-select").val();

            $(".mejs-list").empty();

            $.each(musicserver[playlistselect], function (idx, obj) {
                $.each(getObjects(musicserver.allitems, 'title', obj.title), function (idx, obj) {
                    $('.mejs-list').append('<li highq="' + obj.highq + '" lowq="' + obj.lowq + '" artist="' + obj.creator + '" url="' + settings.music_folder + obj.location + '"><img alt="' + obj.album + '" onerror="this.src=' + "'" + settings.mainimage_folder + "unknown_album.svg'" + '" data-src="' + settings.music_folder + obj.albumart + '" src="' + settings.mainimage_folder + 'unknown_album.svg"><div class="title ellipsis"><span>' + decodeURIComponent(obj.title) + '</span></div><div class="aa ellipsis"><span>' + obj.creator + ' - ' + decodeURIComponent(obj.album) + '</span></div></li>');
                });
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
            $.getScript(settings.unveil_location).done(function () {
                $("img").unveil(500);
                var song = $('.mejs-list li.current');
                var title = decodeURIComponent(song.find('.title').text());
                var artist = decodeURIComponent(song.attr('artist'));
                var album = decodeURIComponent(song.find('img').attr('alt'));
                var cover = song.find('img').attr('src') + '" onerror="this.src=\'' + settings.mainimage_folder + 'unknown_album.svg\'"';
                var cover2 = $(".cover img").attr('src') + '" onerror="this.src=\'' + settings.mainimage_folder + 'unknown_album.svg\'"';

                $('.title-player span').text(title);
                $('.artist-album span').text(artist + ' - ' + album);

                if (cover2 != cover) {
                    $('.cover').html('<img src="' + cover + '/>');
                }

                if ($("#artist img").attr('src') != 'music/' + artist + '/artist.jpg') {
                    $('#artist').html('<img src="music/' + artist + '/artist.jpg"/>');
                } //sets artist cover if #artist is in the html

                $('#download').attr('title', 'Download "' + title + '"');

                // Rotating header text
                var terms = [$.cookie("servername"), 'Now playing: ' + title];

                function rotateTerm() {
                    var ct = $("#headertext").data("term") || 0;
                    $("#headertext").data("term", ct == terms.length - 1 ? 0 : ct + 1).text(terms[ct]).fadeIn(2000).delay(2000).fadeOut(2000, rotateTerm);
                }
                rotateTerm();
				
            });
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
                    audioPlayer.src = audio_src;
                }
                playAudio();
                metadata();
            });
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
                audioPlayer.src = 'reload';
                audioPlayer.src = audio_src;
                if ($('#pause').attr('class') == 'visible') {
                    playAudio();
                } //keep play state.
                metadata();
            });
        }

        /*            // How to use Music Server popup
            function dialogue(content, title) {
				$.getScript(settings.qtip_location[0], $.getScript(settings.qtip_location[1])).done(function () {
					console.log("hoi1")
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
                var message = $('<span />', {
                    html: 'Double click on a track to play<br>Press SPACE to play/pause<br>Press ESCAPE to stop playing<br>Press left/right key to play the previous/next song<br><br><b>Tip!:</b> you can customize your playlist by dragging the desired song to the desired location in your playlist.<br><br>'
                }),
                    ok = $('<button />', {
                        text: 'Thank you!',
                            'class': 'full'
                    });

                dialogue(message.add(ok), 'How to use Music Server:');
			};*/

        // Error popup
        window.createGrowl = function (persistent) {
            $.getScript(settings.qtip_location[0], $.getScript(settings.qtip_location[1])).done(function () {
                console.log("hoi3")
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

    };
}(jQuery));