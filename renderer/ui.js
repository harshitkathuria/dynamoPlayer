// Elements
const playBtn = document.getElementById('play')
const prevBtn = document.getElementById('prev')
const nextBtn = document.getElementById('next')
const music = document.querySelector('audio')
const coverImage = document.querySelector('.cover-image')
const volume = document.querySelector('#volume')
const title = document.getElementById('title')
const artist = document.getElementById('artist')
const songs_listsUI = document.querySelector('ul.songs-list')
let songsList = [], songIdx = 0;

let isPlaying = false, firstTime = true;

const displaySongDetails = () => {
  music.src = songsList[songIdx].path;
  title.innerText = songsList[songIdx].title;
  artist.innerText = songsList[songIdx].artist.join() || 'Artist Not Found';
  coverImage.src = songsList[songIdx].album_cover;
}

const activeColor = (isActive) => {
  let text = document.getElementById(`song-${songIdx}`);
  let seperator = document.getElementById(`song-${songIdx}`).children[0];
  if(isActive) {
    text.style.color = 'white';
    seperator.style.backgroundColor = 'wheat';
    seperator.style.height = '1px';
  }
  else {
    text.style.color = '#ffa806';
    seperator.style.backgroundColor = '#ffa806';
    seperator.style.height = '2px';
  }
}

// Change Volume
volume.addEventListener('input', () => {
  if(isPlaying) {
    music.volume = volume.value / 100;
  }
})

// play function
const playMusic = () => {
  if(firstTime) {
    firstTime = false;
    displaySongDetails();
    activeColor(false);
  }
  playBtn.src = "../assets/img/pause-circle-regular.svg";
  coverImage.classList.add('play-spin');
  coverImage.classList.remove('pause-spin')
  music.play();
  isPlaying = true;
  music.volume = volume.value / 100;
  console.log(volume.value);
}

// pause function
const pauseMusic = () => {
  playBtn.src = "../assets/img/play-circle-regular.svg";
  coverImage.classList.add('pause-spin');
  music.pause();
  isPlaying = false;
}

// next
nextBtn.addEventListener('click', () => {
  pauseMusic()
  console.log('next');
  activeColor(true)
  songIdx = (songIdx + 1) % songsList.length;
  displaySongDetails();
  activeColor(false)
})

// prev
prevBtn.addEventListener('click', () => {
  pauseMusic()
  console.log('prev');
  activeColor(true)
  songIdx = (songIdx - 1 + songsList.length) % songsList.length;
  displaySongDetails();
  activeColor(false)
})

songs_listsUI.addEventListener('click', (e) => {
  if(e.target.classList.contains('song-title')) {
    const song = e.target;
    activeColor(true)
    pauseMusic()
    songIdx = song.id.split('-')[1]
    displaySongDetails()
    activeColor(false)
  }
})

// clicking on play/pause btn
playBtn.addEventListener('click', () => {
  console.log('clicked');
  if(songsList.length)
    isPlaying? pauseMusic() : playMusic();
})

// Toggle Songs List
const List = document.querySelector('.desc')
const toggleListBtn = document.querySelector('.toggle-list')
toggleListBtn.addEventListener('click', () => {
  if(List.style.display !== 'none') {
    List.style.display = 'none'  
    toggleListBtn.classList.replace('fa-angle-left', 'fa-angle-right')
    toggleListBtn.style.right = '-7px';
  }
  else {
    List.style.display = 'block'
    toggleListBtn.classList.replace('fa-angle-right', 'fa-angle-left')
    toggleListBtn.style.right = '-2px'
  }
})

exports.loadSongsList = (songs, toLoad = true) => {
  let markup = '';
  let size = songsList.length;
  for(let i = 0; i < songs.length; i++) {
    songsList.push(songs[i])
    markup += `<li id="song-${size + i}" class="song-title">${songs[i].title}<div class="seperator"></div></li>`
  }
  document.querySelector('.songs-list').innerHTML += markup;

  // SETTING TO LOCAL STORAGE
  // if(toLoad) {
  //   const localSongs = JSON.parse(localStorage.getItem('songs')) || [];
  //   if(localSongs.length === 0) {
  //     localStorage.setItem('songs', JSON.stringify(songs))
  //   }
  //   else {
  //     const arr = localSongs.concat(songs)
  //     localStorage.setItem('songs', JSON.stringify(arr))
  //   }
  // }
}

// GETTING FROM LOCAL STORAGE
// if(localStorage.getItem('songs')) {
//   console.log(JSON.parse(localStorage.getItem('songs')))
//   this.loadSongsList(JSON.parse(localStorage.getItem('songs')), false)
//   console.log(JSON.parse(localStorage.getItem('songs')))
// }