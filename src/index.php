<!doctype html>
<html>
<head>
<meta charset="utf-8">
<title>Naamloos document</title>

<!--Detect Mobile Browser OR screen size-->
<script src="musicserver/server/js/detectmobile.min.js"></script>

<!--JQUERY LIBARIES + HTML5 SHIV-->
<!--[if lt IE 9]>
    <script src="//ajax.googleapis.com/ajax/libs/jquery/1.11.0/jquery.min.js"></script>
    <script src="//html5shiv.googlecode.com/svn/trunk/html5.js"></script>
<![endif]-->
<!--[if gte IE 9]><!-->
    <script src="//ajax.googleapis.com/ajax/libs/jquery/2.1.1/jquery.min.js"></script>
<!--<![endif]-->

<link href="//cdnjs.cloudflare.com/ajax/libs/normalize/3.0.1/normalize.min.css" rel="stylesheet">

<link rel="stylesheet" href="css/style.css">
</head>

<!-- <?PHP

$user_name = "root";
$password = "";
$database = "music_server";
$server = "127.0.0.1";

$db_handle = mysql_connect($server, $user_name, $password);
$db_found = mysql_select_db($database, $db_handle);

if ($db_found) {

	$SQL = "SELECT playlist_id FROM music_playlists INNER JOIN `course` on user.course = course.id";

$result = mysql_query($SQL);

while ( $db_field = mysql_fetch_assoc($result) ) {

echo $db_field['id'] . "<BR>";
echo $db_field['playlist_id'] . "<BR>";
echo $db_field['music_id'] . "<BR><br>";

}

mysql_close($db_handle);

}
else {

echo "Database NOT Found ";
mysql_close($db_handle);

}

?> -->

<body>

    <aside>
    	<div id="top-box">
        	<img src="//musicserver.leijlandia.nl/wolfcms/public/themes/musicserverv1/images/logo.png" id="logo">
            <div id="search">
            	<input name="searchValue" type="text" placeholder="Search" title="Search" autocomplete="off" maxlength="255" spellcheck="false">
                <a title="Search"></a>
            </div>
        </div>
        <div id="playlist"></div>
        <div id="side-buttons">
        	<ul>
                <li><a id="settings" title="Configure Music Server"></a></li>
                <li><a id="info" title="How to use Music Server"></a></li>
                <li><a id="quality" title="Set music quality to low" Class="high"></a></li>
                <!--<li><a id="download" title="Download current song"></a></li>-->
                <li><a id="lock" title="Lock the playlist"></a></li>
                <li><a id="more" title="View more options"></a></li>
            </ul>
        </div>
    </aside>

    <div id="main">
        <table id="now-playing">
            <tbody>
            <tr>
                <td style="width: 1%;">
                    <img src="musicserver/server/images/unknown_album.svg" id="cover">
                </td>
                <td class="meta left">
                    <div id="track">Guide Vocal</div>
                    <div id="album">Duke</div>
                    <div id="artist">Genesis</div>
                    <div id="genre"><p>Rock 1980</p></div>
                </td>
                <td class="meta right">
                    <div id="albumartist">Genesis</div>
                    <div id="tracknumber">#3/12</div>
                    <div id="disc">1/1</div>
                </td>
            </tr>
            </tbody>
        </table>

    </div>
        
    <footer>
    	<div id="seekbar">
        	<div id="current"></div>
        </div>
        <div id="controls">
        	<span id="currenttime">00:29</span>
            <span id="duration">03:22</span>
            <span title="Show sidebar" id="list" class="icon-list"></span>
            <span title="Previous song" id="prev" class="icon-prev"></span>
            <span title="Play song" id="play" class="icon-play"></span>
            <span title="Pause song" id="pause" class="icon-pause"></span>
            <span title="Next song" id="next" class="icon-next"></span>
            <span title="Shuffle playlist" id="shuffle" class="icon-shuffle"></span>
            <span title="Mute audio" id="mute" class="icon-mute"></span>
            <div id="volumebar">
                <div id="currentvolume"></div>
                <div class="handle"></div>
            </div>
        </div>
    </footer>
    
    <script>
        function resize(a) {
            if(a == 'h'){
                var totalheight = $(window).height(),
                    lessheight = $('#top-box').outerHeight() + $('#side-buttons').outerHeight() + $('footer').outerHeight(),
                    docheight = totalheight - lessheight;

                $('#playlist').css("height", docheight);
            } else if(a == 'w'){
                var totalwidthmain = $(window).width(),
                    lesswidthmain = $('body aside').outerWidth(),
                    docwidthmain = totalwidthmain - lesswidthmain;

                var totalmain = $(window).height(),
                    lessmain = $('footer').outerHeight(),
                    docmain = totalmain - lessmain;

                $('#main').css({
                    width: docwidthmain,
                    height: docmain
                });
            }


            // $('.container').css("min-height", '250px'); // i have given minimum height
        }

        $(document).ready(function () {
            resize('h');
            resize('w');
        });

        $(window).resize(function () {
            resize('h');
            resize('w');
        });

        (function ($) {
            // Ignore case sensivity while searching
            jQuery.expr[':'].Contains = function (a, i, m) {
                return (a.textContent || a.innerText || "").toUpperCase().indexOf(m[3].toUpperCase()) >= 0;
            };

            function listFilter(header, list) {
                var input = $('#search input'); // Define the input field
                var list = $('#playlist'); // Define the searchable list/element

                // Search on every typed key and
                // If search field is empty, show all items instead of none
                $(input).change(function () {
                    var filter = $(this).val();
                    if (filter) {
                        $(list).find("a:not(:Contains(" + filter + "))").parent().slideUp();
                        $(list).find("a:Contains(" + filter + ")").parent().slideDown();
                    } else {
                        $(list).find("li").slideDown();
                    }
                    return false;
                }).keyup(function () {
                    $(this).change();
                });
            }

        }(jQuery));
	</script>
    
</body>
</html>