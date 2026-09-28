YOUR OWN MUSIC
==============

The game has built-in songs, so this folder can stay empty.
If you want real recorded songs in the Android app instead, put audio files here and build again
(npm run build, then npx cap sync android).

Name the files like this:

  menu.mp3                      plays on the start screen
  game1.mp3, game2.mp3, ...     play while you run your company, one after another
  war.mp3                       plays during Company Wars

Any name that starts with menu, game or war works, and .mp3, .ogg, .m4a and .wav are all fine.
A mood with no file keeps using the built-in songs, so you can add just one song if you like.

WHERE TO GET SONGS
------------------
Only use music you are allowed to use in an app you sell. Good free places:

  - Pixabay Music (pixabay.com/music)       free for commercial use, no credit needed
  - FreePD (freepd.com)                      public domain, free for anything
  - Kevin MacLeod (incompetech.com)          free if you credit him in the store listing

Tips:
  - Pick songs that loop nicely and are not too loud. Calm lofi or upbeat "corporate" / "happy" tracks fit well.
  - Keep each file under about 3 MB (a 2-3 minute MP3 at 128 kbps) so the app stays small.
  - Never use songs from the radio, Spotify or YouTube videos. Google Play removes apps that do.

The web version (the single HTML file and the web link) always uses the built-in songs.
