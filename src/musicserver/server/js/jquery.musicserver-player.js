/*
 * Music Server HTML5 player
 * Version: 1.0.1
 * Author: Jacky Koning
 * http://musicserver.leijlandia.nl/
 *
 * Description:
 * This is the customized HTML5 player for Music Server.
 * Based on MediaElement.js,
 * http://mediaelementjs.com/
 *
 * Copyright (c) 2014 Jacky Koning <jackykoning@zonnet.nl>
 * Licensed under MIT
 *
 * Date: 19-8-2014
 */

(function ($) {

    $.fn.MusicPlayer = function (options) {

        var settings = $.extend({
            timehandle: '.handle',
            volumehandle: '.volume-handle',
            progress: '.progress',
            duration: '.duration',
            currenttime: '.currenttime',
            bottomrail: '.bottomrail',
            current: '.currentrail',
            volume: '.volume',
            currentvolume: '.current-volume'
        }, options);

        var volume = audioPlayer.volume;

        //get positions of object to be able to move them.
        var timehandle = $(settings.timehandle).position().left;
        var volumehandle = $(settings.volumehandle).position().top;
        var volumeoffset = $(settings.volumehandle).offset().top;
        var timeoffset = $(settings.timehandle).offset().left;
        var audiowidth = $(settings.bottomrail).width() || 450; //use css if set otherwise use value
        var volumeheight = $(settings.volume).height() || 70; //use css if set otherwise use value

        //run once
        $(settings.bottomrail).width(audiowidth);
        $(settings.volume).height(volumeheight);
        $(settings.currentvolume).height(volumeheight);

        $(window).resize(function () { // offsets change when window gets a different size... so when that happens redo offsets
            volumeoffset = $(settings.volumehandle).offset().top - ($(settings.volumehandle).position().top - volumehandle);
            timeoffset = $(settings.timehandle).offset().left - ($(settings.timehandle).position().left - timehandle);
        }); //get new value's not cached ones.

        var mousedown = false;
        var volumemouse = false;
        $(settings.volume).mousedown(function (e) {
            var a = $(this).offset();
            var b = e.pageY - a.top;
            var c = (volumeheight - b) / volumeheight;
            setvolume(c);
            volumemouse = true;
        });

        $(settings.bottomrail).mousedown(function (e) {
            var a = $(this).offset();
            var b = e.pageX - a.left;
            var c = (b) / audiowidth;
            updaterail(c);
            mousedown = true;
        });

        $(window).mousemove(function (e) {
            if (mousedown === true) {
                updaterail((e.pageX - timeoffset + parseInt($(settings.timehandle).css('margin-left'), 10)) / audiowidth);
                updatetime();
            }
            if (volumemouse === true) {
                setvolume((volumeheight - (e.pageY - volumeoffset + parseInt($(settings.volumehandle).css('margin-top'), 10))) / volumeheight);
            }
        });

        $(window).mouseup(function (e) { //stop movement
            mousedown = false;
            volumemouse = false;
        });

        $(settings.bottomrail).mouseover(function (e) {
            document.getElementById('popup').style.display = 'block';
        });

        $(settings.bottomrail).mousemove(function (e) {
            var a = $(this).offset();
            var b = e.pageX - a.left;
            var c = b / audiowidth;
            var d = c * audioPlayer.duration;
            $('#popup').css('left', b - 20);
            var m = Math.floor(d / 60) || 0;
            var f = Math.floor(d - (m * 60)) || 0;
            if (m < 0) {} else {
                $('#popup').html(('0' + m).slice(-2) + ':' + ('0' + f).slice(-2));
            }

        });

        $(settings.bottomrail).mouseout(function () {
            $('#popup').hide();
        });

        $('#mute').click(function () { //mute button
            var a = document.getElementById("mute");
            var b = a.className;
            if (b == "muted") {
                a.className = "mute";
                audioPlayer.muted = false;
                setvolume(1);
            } else {
                a.className = "muted";
                audioPlayer.muted = true;
                setvolume(0);
            }
        });

        /////////////////////////////////////////////////////////// FUNCTIONS
		
		var url = $('.mejs-list .current').attr('url');
		console.log(url);
		        
        AudioOrSaudio = function(url) {
        	var extension = url.split('.').pop().toLowerCase();
			console.log(extension);
        	uninit();
        	if (extension === "mp3" || extension === "wav" || extension === "opus" || extension === "mp3") {
        		audioplayerinit(url);
        	} else if (extension === "flac" || extension === "m4a") {
        		saudioplayerinit(url);
        	}
        }
        
        function audioplayerinit(url) {
        	delete audioPlayer;
			audioPlayer = document.getElementsByTagName('audio')[0];
            audioPlayer.src = url;
			$(audioPlayer).bind('timeupdate', updatetime);
        	$(audioPlayer).bind('progress', onprogress);
        	$(audioPlayer).bind('durationchange', updatetimemax);
        	$(audioPlayer).bind('play', setplaying);
        	$(audioPlayer).bind('pause', setpaused);
        }
        
        function saudioplayerinit(url) {
        	delete SaudioPlayer;
			SaudioPlayer = new AV.Player.fromURL(url);
    		SaudioPlayer.on('buffer', onbuffer = function(percent) { onprogress(percent); });
    		SaudioPlayer.on('progress', onprogress = function(time) { updatetime(time); });
    		SaudioPlayer.on('duration', onduration = function(duration) { updatetimemax(duration); });
    		SaudioPlayer.on('metadata', onmetadata = function(data) { });
        }
        
        function uninit() {
        	if (typeof(audioPlayer) != "undefined") {
        		audioPlayer.pause()
        		delete audioPlayer;
        	}
        	if (typeof(SaudioPlayer) != "undefined") {
        		SaudioPlayer.pause();
        		delete SaudioPlayer;
        	}
        }
        
        function updatetime(time) {
        	if (typeof(SaudioPlayer) != "undefined") {
        		a = time / SaudioPlayer.duration * audiowidth
            }
            if (typeof(audioPlayer) != "undefined") {
            	a = audioPlayer.currentTime / audioPlayer.duration * audiowidth
            }
            $(settings.current).width(a);
            if (a === audiowidth) {
                $('#next').click();
            }
            $(settings.timehandle).css('left', a + timehandle);
            $(settings.bottomrail).width(audiowidth);
            var d = time / 1000 || audioPlayer.currentTime || 0;
            var e = Math.floor(d / 60) || 0;
            var f = Math.floor(d - (e * 60)) || 0;
            $(settings.currenttime).html(('0' + e).slice(-2) + ':' + ('0' + f).slice(-2));
        }

        function onprogress(procent) {
        if (procent) {
                var d = procent * audiowidth;
                $(settings.progress).width(d.toFixed(0));
        }
            try {
                var v = audioPlayer;
                var r = v.buffered;
                var a = v.duration;
                var b = r.start(0);
                var c = r.end(0);
                var d = (c / a) * audiowidth;
                $(settings.progress).width(d.toFixed(0));
            } catch (e) {} //catch script being run too soon errors
        }

        function updatetimemax(time) {
            var a = time / 1000 || audioPlayer.duration || 0;
            var b = Math.floor(a / 60) || 0;
            var c = Math.floor(a - (b * 60)) || 0;
            $(settings.duration).html(('0' + b).slice(-2) + ':' + ('0' + c).slice(-2));
        }

        function setplaying() {
            $('#play').addClass('hidden');
            $('#pause').addClass('visible');
        }

        function setpaused() {
            $('#play').removeClass('hidden');
            $('#pause').removeClass('visible');
        }

        function setvolume(a) {
            var b = document.getElementById("mute");
            if (a >= 1) {
                audioPlayer.volume = 1;
                a = 1;
            }
            if (a <= 0) {
                audioPlayer.volume = 0;
                b.className = "muted";
                a = 0;
            } else {
                b.className = "mute";
            }
            audioPlayer.volume = a;
            $(settings.currentvolume).height(a * volumeheight);
            $(settings.volumehandle).css('top', volumeheight - a * volumeheight);
        }

        function updaterail(a) { //time rail updater
            try {
                audioPlayer.currentTime = audioPlayer.duration * a;
            } catch (e) {} //catch errors from undefined
        }

    };
}(jQuery));