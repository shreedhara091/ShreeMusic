// Stores the currently loaded audio track.
let currentSong = new Audio();

// Stores the list of songs in the current folder.
let songs;

// Stores the currently selected songs folder.
let currFolder;


// Supabase Songs bucket URL.
const supabaseURL =
    "https://tjdshgaqvqtjzqyfjoql.supabase.co/storage/v1/object";


// Formats seconds into MM:SS format.
function formatTime(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    let minutes = Math.floor(seconds / 60);
    let remainingSeconds = Math.floor(seconds % 60);

    return `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
}


// Fetches songs from a folder and displays them in the song list.
async function getSongs(folder) {

    currFolder = folder;

    // Fetch the folder contents from Supabase.
    let a = await fetch(
        `${supabaseURL}/list/Songs`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                prefix: `${folder}/`,
                limit: 100
            })
        }
    );

    let response = await a.json();

    // Find only MP3 files.
    songs = [];

    for (const element of response) {

        if (element.name && element.name.endsWith(".mp3")) {
            songs.push(element.name);
        }
    }


    // Clear the existing song list.
    let songUL =
        document.querySelector(".songList").getElementsByTagName("ul")[0];

    songUL.innerHTML = "";


    // Create a list item for each song.
    for (const song of songs) {

        songUL.innerHTML = songUL.innerHTML + `
            <li>
                <img src="img/music.svg" alt="music">

                <div class="info">
                    <div>${song}</div>
                    <div>Shree</div>
                </div>

                <div class="playNow">
                    <span>Play Now</span>
                    <img src="img/songPlay.svg" alt="play">
                </div>
            </li>
        `;
    }


    // Add click events to each song.
    Array.from(
        document.querySelector(".songList").getElementsByTagName("li")
    ).forEach(e => {

        e.addEventListener("click", () => {

            playMusic(
                e.getElementsByTagName("div")[0]
                    .firstElementChild
                    .innerHTML
                    .trim()
            );

        });

    });


    return songs;
}


// Loads and optionally plays a song.
const playMusic = (track, pause = false) => {

    currentSong.src =
        `${supabaseURL}/public/Songs/${currFolder}/${encodeURIComponent(track)}`;


    // Play the song unless pause mode is enabled.
    if (!pause) {

        currentSong.play();

        play.src = "img/pause.svg";
    }


    // Update the currently playing song information.
    document.querySelector(".songInfo").innerHTML = track;

    document.querySelector(".songTime").innerHTML =
        "00:00 / 00:00";
};


// Loads album/playlist information and creates album cards.
async function displayAlbum() {

    // Fetch the Songs directory from Supabase.
    let a = await fetch(
        `${supabaseURL}/list/Songs`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                limit: 100
            })
        }
    );

    let response = await a.json();


    // Find playlist folders.
    let folders = [];

    for (const element of response) {

        if (
            element.name &&
            element.name.startsWith("playlist-")
        ) {
            folders.push(element.name);
        }
    }


    let cardContainer =
        document.querySelector(".cardContainer");


    // Create a card for each playlist folder.
    for (let index = 0; index < folders.length; index++) {

        const folder = folders[index];


        // Fetch playlist information.
        let a = await fetch(
            `${supabaseURL}/public/Songs/${folder}/info.json`
        );


        if (!a.ok) {
            console.log(`info.json not found for ${folder}`);
            continue;
        }


        let response = await a.json();


        // Add the playlist card to the page.
        cardContainer.innerHTML =
            cardContainer.innerHTML +

            `
            <div data-folder="${folder}" class="card">

                <div class="play">

                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        width="38"
                        height="38">

                        <circle
                            cx="12"
                            cy="12"
                            r="12"
                            fill="#1ED760" />

                        <path
                            d="M18.8906 12.846C18.5371 14.189 16.8667 15.138 13.5257 17.0361C10.296 18.8709 8.6812 19.7884 7.37983 19.4196C6.8418 19.2671 6.35159 18.9776 5.95624 18.5787C5 17.6139 5 15.7426 5 12C5 8.2574 5 6.3861 5.95624 5.42132C6.35159 5.02245 6.8418 4.73288 7.37983 4.58042C8.6812 4.21165 10.296 5.12907 13.5257 6.96393C16.8667 8.86197 18.5371 9.811 18.8906 11.154C19.0365 11.7084 19.0365 12.2916 18.8906 12.846Z"
                            fill="#000000"
                            transform="translate(12 12) scale(0.65) translate(-12 -12)" />

                    </svg>

                </div>

                <img
                    src="${supabaseURL}/public/Songs/${folder}/cover.png"
                    alt="card-1">

                <h3>${response.title}</h3>

                <p>${response.description}</p>

            </div>
            `;
    }


    // Add click events to album cards.
    Array.from(
        document.getElementsByClassName("card")
    ).forEach(e => {

        e.addEventListener("click", async item => {

            // Get the selected playlist folder.
            let folder =
                item.currentTarget.dataset.folder;


            // Load songs from the selected playlist.
            await getSongs(folder);


            // Play the first song.
            if (songs.length > 0) {
                playMusic(songs[0]);
            }

        });

    });
}


// Main function that initializes the music player.
async function main() {

    // Load the default playlist.
    await getSongs("playlist-1");


    // Load the first song without playing it automatically.
    if (songs.length > 0) {
        playMusic(songs[0], true);
    }


    // Display all available albums/playlists.
    displayAlbum();


    // Play/pause button functionality.
    play.addEventListener("click", () => {

        if (currentSong.paused) {

            currentSong.play();

            play.src = "img/pause.svg";

        }

        else {

            currentSong.pause();

            play.src = "img/play.svg";

        }

    });


    // Update the progress bar and song time.
    currentSong.addEventListener("timeupdate", () => {

        document.querySelector(".songTime").innerHTML =
            `${formatTime(currentSong.currentTime)} /
             ${formatTime(currentSong.duration)}`;


        document.querySelector(".circle").style.left =
            currentSong.currentTime /
            currentSong.duration *
            99 + "%";

    });


    // Allows the user to seek to a specific position.
    document.querySelector(".seekBar").addEventListener("click", e => {

        let percent =
            e.offsetX /
            e.target.getBoundingClientRect().width *
            100;


        document.querySelector(".circle").style.left =
            percent + "%";


        currentSong.currentTime =
            currentSong.duration * percent / 100;

    });


    // Opens the mobile sidebar.
    document.querySelector(".hamburger").addEventListener("click", () => {

        document.querySelector(".left").style.left = "0px";

    });


    // Closes the mobile sidebar.
    document.querySelector(".close").addEventListener("click", () => {

        document.querySelector(".left").style.left = "-120%";

    });


    // Plays the previous song.
    previous.addEventListener("click", () => {

        let currentTrack =
            decodeURIComponent(
                currentSong.src.split("/").pop()
            );


        let index =
            songs.indexOf(currentTrack);


        if (index > 0) {

            playMusic(songs[index - 1]);

        }

    });


    // Plays the next song.
    next.addEventListener("click", () => {

        let currentTrack =
            decodeURIComponent(
                currentSong.src.split("/").pop()
            );


        let index =
            songs.indexOf(currentTrack);


        if (index < songs.length - 1) {

            playMusic(songs[index + 1]);

        }

    });


    // Controls the audio volume.
    document
        .querySelector(".range")
        .getElementsByTagName("input")[0]
        .addEventListener("change", (e) => {

            currentSong.volume =
                parseInt(e.target.value) / 100;


            if (currentSong.volume > 0) {

                document.querySelector(".volume>img").src =
                    document.querySelector(".volume>img").src
                        .replace(
                            "img/mute.svg",
                            "img/volume.svg"
                        );

            }

            else {

                document.querySelector(".volume>img").src =
                    document.querySelector(".volume>img").src
                        .replace(
                            "img/volume.svg",
                            "img/mute.svg"
                        );

            }

        });


    // Mutes and unmutes the audio.
    document
        .querySelector(".volume>img")
        .addEventListener("click", e => {

            if (e.target.src.includes("img/volume.svg")) {

                e.target.src =
                    e.target.src.replace(
                        "img/volume.svg",
                        "img/mute.svg"
                    );

                currentSong.volume = 0;

                document
                    .querySelector(".range")
                    .getElementsByTagName("input")[0]
                    .value = 0;

            }

            else {

                e.target.src =
                    e.target.src.replace(
                        "img/mute.svg",
                        "img/volume.svg"
                    );

                currentSong.volume = .10;

                document
                    .querySelector(".range")
                    .getElementsByTagName("input")[0]
                    .value = 10;

            }

        });

}

// Start the music player.
main();