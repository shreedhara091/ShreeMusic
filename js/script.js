// Supabase project URL.
const SUPABASE_URL = "https://tjdshgaqvqtjzqyfjoql.supabase.co";

// Supabase publishable key.
const SUPABASE_KEY = "sb_publishable_bcxRKjZDyAl0xe138Ky2Mg_b5k5xONf";


// Stores the currently loaded audio track.
let currentSong = new Audio();

// Stores the list of songs in the current folder.
let songs;

// Stores the currently selected songs folder.
let currFolder;


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
// Fetches songs from a folder and displays them in the song list.
async function getSongs(folder) {

    currFolder = folder;

    let a = await fetch(
        `${SUPABASE_URL}/storage/v1/object/list/Songs`,
        {
            method: "POST",

            headers: {
                "Content-Type": "application/json",
                "apikey": SUPABASE_KEY,
                "Authorization": `Bearer ${SUPABASE_KEY}`
            },

            body: JSON.stringify({
                prefix: `${folder}/`,
                limit: 100,
                offset: 0
            })
        }
    );

    // Get the response as JSON
    let response = await a.json();

    // IMPORTANT: show the actual Supabase error
    if (!a.ok) {
        console.error("Supabase error:", a.status, response);
        return [];
    }

    console.log(`Songs in ${folder}:`, response);

    songs = response
        .filter(file => file.name && file.name.endsWith(".mp3"))
        .map(file => file.name);

    let songUL = document
        .querySelector(".songList")
        .getElementsByTagName("ul")[0];

    songUL.innerHTML = "";

    for (const song of songs) {

        songUL.innerHTML += `
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
        `${SUPABASE_URL}/storage/v1/object/public/Songs/${currFolder}/${encodeURIComponent(track)}`;


    // Play the song unless pause mode is enabled.
    if (!pause) {

        currentSong.play();

        play.src = "img/pause.svg";
    }


    // Update song information.
    document.querySelector(".songInfo").innerHTML = track;

    document.querySelector(".songTime").innerHTML =
        "00:00 / 00:00";
};


// Loads album/playlist information and creates album cards.
// Loads album/playlist information and creates album cards.
async function displayAlbum() {

    const cardContainer =
        document.querySelector(".cardContainer");

    // Get all playlist folders from Supabase.
    let a = await fetch(
        `${SUPABASE_URL}/storage/v1/object/list/Songs`,
        {
            method: "POST",

            headers: {
                "Content-Type": "application/json",
                "apikey": SUPABASE_KEY,
                "Authorization": `Bearer ${SUPABASE_KEY}`
            },

            body: JSON.stringify({
                prefix: "",
                limit: 100,
                offset: 0
            })
        }
    );

    // Check for error.
    if (!a.ok) {

        console.error(
            "Supabase album error:",
            a.status,
            await a.text()
        );

        return;
    }

    let response = await a.json();

    console.log("Supabase Songs:", response);

    cardContainer.innerHTML = "";

    // Get playlist folders.
    let folders = response
        .filter(item =>
            item.name &&
            item.name.startsWith("playlist-")
        )
        .map(item => item.name);

    console.log("Playlists:", folders);

    // Create a card for every playlist.
    for (const folder of folders) {

        // Get info.json.
        let infoResponse = await fetch(
            `${SUPABASE_URL}/storage/v1/object/public/Songs/${folder}/info.json`
        );

        if (!infoResponse.ok) {

            console.log(
                `info.json not found for ${folder}`
            );

            continue;
        }

        let info = await infoResponse.json();

        // Add playlist card.
        cardContainer.innerHTML =
            cardContainer.innerHTML + `

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
                            fill="#1ED760"/>

                        <path
                            d="M18.8906 12.846C18.5371 14.189 16.8667 15.138 13.5257 17.0361C10.296 18.8709 8.6812 19.7884 7.37983 19.4196C6.8418 19.2671 6.35159 18.9776 5.95624 18.5787C5 17.6139 5 15.7426 5 12C5 8.2574 5 6.3861 5.95624 5.42132C6.35159 5.02245 6.8418 4.73288 7.37983 4.58042C8.6812 4.21165 10.296 5.12907 13.5257 6.96393C16.8667 8.86197 18.5371 9.811 18.8906 11.154C19.0365 11.7084 19.0365 12.2916 18.8906 12.846Z"

                            fill="#000000"

                            transform="translate(12 12) scale(0.65) translate(-12 -12)"/>

                    </svg>

                </div>

                <img
                    src="${SUPABASE_URL}/storage/v1/object/public/Songs/${folder}/cover.png"
                    alt="${info.title || folder}">

                <h3>${info.title || folder}</h3>

                <p>${info.description || ""}</p>

            </div>
        `;
    }

    // Add click event to every playlist.
    Array.from(
        document.getElementsByClassName("card")
    ).forEach(card => {

        card.addEventListener("click", async () => {

            const folder = card.dataset.folder;

            await getSongs(folder);

            if (songs && songs.length > 0) {

                playMusic(songs[0]);

            }

        });

    });
}

// Main function that initializes the music player.
async function main() {


    // Load the default playlist.
    await getSongs("playlist-1");

    if (songs && songs.length > 0) {
        playMusic(songs[0], true);
    }


    // Display all playlists.
    await displayAlbum();


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


    // Update progress bar and song time.
    currentSong.addEventListener("timeupdate", () => {

        document.querySelector(".songTime").innerHTML =
            `${formatTime(currentSong.currentTime)} /
            ${formatTime(currentSong.duration)}`;


        if (currentSong.duration) {

            document.querySelector(".circle").style.left =
                currentSong.currentTime /
                currentSong.duration *
                99 + "%";
        }

    });


    // Seek bar functionality.
    document.querySelector(".seekBar")
        .addEventListener("click", e => {

            let percent =
                e.offsetX /
                e.target.getBoundingClientRect().width *
                100;


            document.querySelector(".circle")
                .style.left = percent + "%";


            currentSong.currentTime =
                currentSong.duration *
                percent / 100;

        });


    // Opens mobile sidebar.
    document.querySelector(".hamburger")
        .addEventListener("click", () => {

            document.querySelector(".left")
                .style.left = "0px";

        });


    // Closes mobile sidebar.
    document.querySelector(".close")
        .addEventListener("click", () => {

            document.querySelector(".left")
                .style.left = "-120%";

        });


    // Previous song.
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


    // Next song.
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


    // Volume control.
    document.querySelector(".range")
        .getElementsByTagName("input")[0]
        .addEventListener("change", e => {

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


    // Mute/unmute.
    document.querySelector(".volume>img")
        .addEventListener("click", e => {

            if (e.target.src.includes("img/volume.svg")) {

                // Mute.
                e.target.src =
                    e.target.src.replace(
                        "img/volume.svg",
                        "img/mute.svg"
                    );


                currentSong.volume = 0;


                document.querySelector(".range")
                    .getElementsByTagName("input")[0]
                    .value = 0;

            }
            else {

                // Unmute.
                e.target.src =
                    e.target.src.replace(
                        "img/mute.svg",
                        "img/volume.svg"
                    );


                currentSong.volume = 0.10;


                document.querySelector(".range")
                    .getElementsByTagName("input")[0]
                    .value = 10;
            }

        });

}


// Start the music player.
main();