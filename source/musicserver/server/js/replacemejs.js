(function ($) {
    jQuery(document).ready(function () {
    	//pre variables
    	var player = AV.Player
        var audioPlayer = player.fromURL('A Line In The Sand.m4a'); //get audio player
        var volume = audioPlayer.volume;
        console.log(player.duration)
        
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
    	
    	//event listeners
        audioPlayer.ontimeupdate = function () {
            updatetime();
        };

        audioPlayer.onprogress = function () {
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

        audioPlayer.onloadedmetadata = function () {
            var a = audioPlayer.duration || 0;
            var b = Math.floor(a / 60) || 0;
            var c = Math.floor(a - (b * 60)) || 0;
            $('.maxtime').html(('0' + b).slice(-2) + ':' + ('0' + c).slice(-2));
        };
        
    	//functions
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
        console.log(audioPlayer.volume)
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
        
        $(document).keydown(function (e) {
            switch (e.which) {

                case 38:
                    volume = ((Math.floor(audioPlayer.volume * 100, 1) + 5) / 100);
                    setvolume(volume);
                    break;

                case 40:
                    volume = ((Math.floor(audioPlayer.volume * 100, 1) - 5) / 100);
                    setvolume(volume);
                    break;

                default:
                    return; // exit this handler for other keys
            }
            e.preventDefault(); // prevent the default action (scroll / move caret)
        });
    });
}(jQuery));