<?php

/*
update 20-03-2015
Changed to PDO
*/

$db = new PDO('sqlite://Music.sqlite');

$db->exec(
'CREATE TABLE songs 
	( 
		id          INTEGER PRIMARY KEY, 
		artistname  TEXT, 
		tracktitle  TEXT, 
		date        TEXT, 
		genre       TEXT, 
		composer    TEXT, 
		performer   TEXT, 
		albumartist TEXT, 
		tracknumber INTEGER, 
		totaltracks INTEGER, 
		discnumber  INTEGER, 
		totaldiscs  INTEGER 
	);'
);

$db->exec(
'CREATE TABLE IF NOT EXISTS playlistsongs 
	(
		idplaylistsong INTEGER PRIMARY KEY, 
		idplaylist     INTEGER REFERENCES playlists (idplaylist), 
		idsong         INTEGER REFERENCES songs (id) 
	);'
);

$db->exec(
'CREATE TABLE IF NOT EXISTS playlists 
	( 
		idplaylist   INTEGER PRIMARY KEY, 
		playlistname TEXT 
	);'
);

?>