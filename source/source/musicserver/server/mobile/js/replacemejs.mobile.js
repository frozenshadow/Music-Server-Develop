(function ($) {
    jQuery(document).ready(function () {
    	//pre variables
        var audioPlayer = document.getElementsByTagName('audio')[0]; //get audio player
        var volume = audioPlayer.volume;
        
        //get positions of object to be able to move them.
        var timehandle = $('.railhandle').position().left;
        var timeoffset = $('.railhandle').offset().left;
        var audiowidth = window.innerWidth - 130

        //run once
    	$('.bottomrail').width(audiowidth);
    	
    	//event listeners
    	$(audioPlayer).bind('timeupdate', updatetime);
        $(audioPlayer).bind('progress', onprogress);
        $(audioPlayer).bind('loadedmetadata', updatetimemax);
        $(audioPlayer).bind('play', setplaying);
        $(audioPlayer).bind('pause', setpaused);


		//functions
        function onprogress() {
            try {
                var v = audioPlayer;
                var r = v.buffered;
                var a = v.duration;
                var b = r.start(0);
                var c = r.end(0);
                var d = (c / a) * audiowidth;
                $('.bottomrailprogres').width(d.toFixed(0));
            } catch (e) {} //catch script being run too soon errors
        };

        function updatetimemax() {
            var a = audioPlayer.duration || 0;
            var b = Math.floor(a / 60) || 0;
            var c = Math.floor(a - (b * 60)) || 0;
            $('.maxtime').html(('0' + b).slice(-2) + ':' + ('0' + c).slice(-2));
        };
        
        function setplaying() {
            $('#play').addClass('hidden');
            $('#pause').addClass('visible');
        }
        
        function setpaused() {
            $('#play').removeClass('hidden');
            $('#pause').removeClass('visible');
        }
        
        function updatetime() {
            var a = audioPlayer.currentTime / audioPlayer.duration * audiowidth;
            $('.currentrail').width(a);
            if (a === audiowidth) {
                $('#next').click();
            }
            $('.railhandle').css('left', a + timehandle);
            $('.bottomrail').width(audiowidth);
            var d = audioPlayer.currentTime || 0;
            var e = Math.floor(d / 60) || 0;
            var f = Math.floor(d - (e * 60)) || 0;
            $('.currenttime').html(('0' + e).slice(-2) + ':' + ('0' + f).slice(-2));
        }

        $(window).resize(function () { // offsets change when window gets a different size... so when that happens redo offsets
            timeoffset = $('.railhandle').offset().left - ($('.railhandle').position().left - timehandle);
        	audiowidth = window.innerWidth - 130
    		$('.bottomrail').width(audiowidth);
        }); //get new value's not cached ones.

        var mousedown = false;
        $(".bottomrail").mousedown(function (e) {
            var a = $(this).offset();
            var b = e.pageX - a.left;
            var c = (b) / audiowidth;
            updaterail(c);
            mousedown = true;
        });

        $(window).mousemove(function (e) {
            if (mousedown === true) {
                updaterail((e.pageX - timeoffset + parseInt($('.railhandle').css('margin-left'), 10) - $('.bottomrail').offset().left) / audiowidth);
                updatetime();
            }
        });

        $(window).mouseup(function (e) { //stop movement
            mousedown = false;
            volumemouse = false;
        });

        function updaterail(a) { //time rail updater
            try {
                audioPlayer.currentTime = audioPlayer.duration * a;
            } catch (e) {} //catch errors from undefined
        }
        
		//buttons
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
    });
}(jQuery));