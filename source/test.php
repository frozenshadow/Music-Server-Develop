<?php
$db = new SQLite3('Music.sqlite');

$db->exec(
'CREATE TABLE Songs (ID INTEGER PRIMARY KEY, ArtistName TEXT, TrackTitle TEXT, Date TEXT, Genre TEXT, Composer TEXT, Performer TEXT, AlbumArtist TEXT, TrackNumber INTEGER, TotalTracks INTEGER, DiscNumber INTEGER, TotalDiscs INTEGER);'
);

$db->exec(
'CREATE TABLE PlaylistSongs (IDPlaylistSong INTEGER PRIMARY KEY, IDPlaylist INTEGER REFERENCES Playlists (IDPlaylist), IDSong INTEGER REFERENCES Songs (ID));'
);

$db->exec(
'CREATE TABLE Playlists (IDPlaylist INTEGER PRIMARY KEY, PlaylistName TEXT);'
);

?>