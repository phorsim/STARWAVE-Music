const audio = document.getElementById("audio");
const playButton = document.getElementById("play-btn");
const playerTitle = document.getElementById("player-title");
const playerArtist = document.getElementById("player-artist");
const toast = document.getElementById("toast");

const showToast = (message) => {
    toast.textContent = message;
    toast.classList.add("show");
    window.clearTimeout(showToast.timer);
    showToast.timer = window.setTimeout(() => toast.classList.remove("show"), 2200);
};

const setView = (viewName) => {
    document.querySelectorAll(".view").forEach((view) => view.classList.toggle("active", view.id === `${viewName}-view`));
    document.querySelectorAll("[data-view]").forEach((button) => button.classList.toggle("active", button.dataset.view === viewName));
};

document.querySelectorAll("[data-view]").forEach((button) => {
    button.addEventListener("click", () => setView(button.dataset.view));
});

document.querySelectorAll("[data-goto]").forEach((button) => {
    button.addEventListener("click", () => setView(button.dataset.goto));
});

const setSong = (title, artist) => {
    playerTitle.textContent = title;
    playerArtist.textContent = artist;
};

const demoTracks = new Map([
    ["Midnight Bloom", { artist: "Nova Lane", notes: [261.63, 329.63, 392, 493.88], seed: 1 }],
    ["Ocean Drive", { artist: "The Satellites", notes: [220, 277.18, 329.63, 440], seed: 2 }],
    ["Golden Hour", { artist: "Maya Rose", notes: [293.66, 369.99, 440, 554.37], seed: 3 }],
    ["Neon Dreams", { artist: "Electric Youth", notes: [246.94, 311.13, 369.99, 493.88], seed: 4 }],
    ["Cherry Sky", { artist: "Velvet Echo", notes: [329.63, 392, 440, 523.25], seed: 5 }],
    ["Quiet Riot", { artist: "Aria Blue", notes: [196, 246.94, 293.66, 369.99], seed: 6 }],
    ["Moonlit Avenue", { artist: "Night Parade", notes: [220, 261.63, 329.63, 392], seed: 7 }],
    ["Runaway Pulse", { artist: "Luna Arcade", notes: [277.18, 369.99, 415.3, 554.37], seed: 8 }]
]);

const demoUrls = new Map();

const makeDemoTrack = (title) => {
    const track = demoTracks.get(title);
    const sampleRate = 16000;
    const duration = 18;
    const samples = sampleRate * duration;
    const buffer = new ArrayBuffer(44 + samples * 2);
    const view = new DataView(buffer);
    const writeText = (offset, text) => {
        for (let index = 0; index < text.length; index += 1) view.setUint8(offset + index, text.charCodeAt(index));
    };

    writeText(0, "RIFF");
    view.setUint32(4, 36 + samples * 2, true);
    writeText(8, "WAVEfmt ");
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeText(36, "data");
    view.setUint32(40, samples * 2, true);

    for (let index = 0; index < samples; index += 1) {
        const time = index / sampleRate;
        const beat = Math.floor(time / 0.4);
        const beatTime = time % 0.4;
        const noteIndex = (beat + track.seed) % track.notes.length;
        const frequency = track.notes[noteIndex];
        const bass = track.notes[(noteIndex + 1) % track.notes.length] / 2;
        const envelope = Math.min(1, beatTime * 12) * Math.min(1, (0.4 - beatTime) * 12);
        const fade = Math.min(1, time / 0.8, (duration - time) / 0.8);
        const sample = (
            Math.sin(2 * Math.PI * frequency * time) * 0.18 +
            Math.sin(2 * Math.PI * bass * time) * 0.12 +
            Math.sin(2 * Math.PI * frequency * 2 * time) * 0.035 +
            Math.sin(2 * Math.PI * 55 * time + track.seed) * 0.025
        ) * envelope * fade;
        view.setInt16(44 + index * 2, Math.max(-1, Math.min(1, sample)) * 32767, true);
    }

    const url = URL.createObjectURL(new Blob([buffer], { type: "audio/wav" }));
    demoUrls.set(title, url);
    return url;
};

const playDemoTrack = (title) => {
    const track = demoTracks.get(title);
    if (!track) return;
    audio.src = demoUrls.get(title) || makeDemoTrack(title);
    setSong(title, track.artist);
    audio.play().catch(() => showToast("Tap play again to start this preview"));
};

document.querySelectorAll("#recent-list .track-row").forEach((row) => {
    row.style.cursor = "pointer";
    row.addEventListener("click", (event) => {
        if (event.target.closest(".icon-btn")) return;
        playDemoTrack(row.querySelector(".track-name strong").textContent);
    });
});

document.querySelectorAll("#quick-picks .music-card").forEach((card) => {
    card.addEventListener("click", () => playDemoTrack(card.querySelector("h3").textContent));
});

playButton.addEventListener("click", () => {
    if (!audio.src) {
        showToast("Add an audio file or direct audio link to play music");
        return;
    }
    if (audio.paused) audio.play();
    else audio.pause();
});

audio.addEventListener("play", () => { playButton.textContent = "❚❚"; });
audio.addEventListener("pause", () => { playButton.textContent = "▶"; });
audio.addEventListener("timeupdate", () => {
    if (!audio.duration) return;
    document.getElementById("progress").value = String((audio.currentTime / audio.duration) * 100);
    document.getElementById("current-time").textContent = formatTime(audio.currentTime);
    document.getElementById("duration").textContent = formatTime(audio.duration);
});

document.getElementById("progress").addEventListener("input", (event) => {
    if (audio.duration) audio.currentTime = (Number(event.target.value) / 100) * audio.duration;
});

document.getElementById("volume").addEventListener("input", (event) => { audio.volume = Number(event.target.value); });
audio.volume = 0.8;

const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainder = Math.floor(seconds % 60).toString().padStart(2, "0");
    return `${minutes}:${remainder}`;
};

document.querySelectorAll(".row-actions .icon-btn").forEach((button) => {
    button.addEventListener("click", () => {
        const liked = button.classList.toggle("liked");
        button.textContent = liked ? "♥" : "♡";
        showToast(liked ? "Added to liked songs" : "Removed from liked songs");
    });
});

const addDialog = document.getElementById("add-dialog");
document.querySelectorAll("#hero-upload, #add-music-bottom, #library-upload, #empty-upload").forEach((button) => {
    button.addEventListener("click", () => addDialog.showModal());
});

document.getElementById("choose-files").addEventListener("click", () => document.getElementById("file-input").click());
document.getElementById("file-input").addEventListener("change", (event) => {
    const [file] = event.target.files;
    if (!file) return;
    audio.src = URL.createObjectURL(file);
    setSong(file.name.replace(/\.[^.]+$/, ""), "Local upload");
    addDialog.close();
    audio.play();
});

document.getElementById("add-url").addEventListener("click", () => {
    const title = document.getElementById("url-title").value.trim();
    const artist = document.getElementById("url-artist").value.trim();
    const url = document.getElementById("url-audio").value.trim();
    if (!title || !artist || !url) {
        document.getElementById("add-error").textContent = "Enter a title, artist, and direct audio URL.";
        return;
    }
    audio.src = url;
    setSong(title, artist);
    addDialog.close();
    audio.play().catch(() => showToast("The audio link could not be played"));
});

const playlistDialog = document.getElementById("playlist-dialog");
document.getElementById("create-playlist").addEventListener("click", () => playlistDialog.showModal());
document.getElementById("save-playlist").addEventListener("click", () => {
    const name = document.getElementById("new-playlist-name").value.trim();
    if (!name) return;
    playlistDialog.close();
    showToast(`Created playlist "${name}"`);
});

const searchInput = document.getElementById("global-search");
const pageSearch = document.getElementById("page-search");
[searchInput, pageSearch].forEach((input) => {
    input.addEventListener("input", () => {
        const query = input.value.toLowerCase();
        document.querySelectorAll("#recent-list .track-row").forEach((row) => {
            row.hidden = !row.textContent.toLowerCase().includes(query);
        });
    });
});

if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => navigator.serviceWorker.register("./service-worker.js").catch(() => { }));
}
