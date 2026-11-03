document
    .getElementById("artist-form")
    .addEventListener("submit", async function (event) {
        event.preventDefault();

        const search_term = document.getElementById("form-input-artist").value;
        searchArtist(search_term).then((result) => {
            console.log(result);
        });
    });

document
    .getElementById("album-form")
    .addEventListener("submit", async function (event) {
        event.preventDefault();

        const search_term = document.getElementById("form-input-album").value;
        searchAlbums(search_term, 50).then(async (result) => {
            const display = document.getElementById("display-area");
            const album_display = display.querySelector("#album-display");
            const ep_display = display.querySelector("#ep-display");
            const single_display = display.querySelector("#single-display");

            // display.replaceChildren();
            display.querySelectorAll("p").forEach(p => p.remove());

            console.log(result);
            
            for (const release of result) {
                const release_type = release["primary-type"];
                const release_name = release.title;
                console.log(release_type);
                const p = document.createElement("p");
                p.textContent = release_name;

                if (release_type == "Album") {
                    album_display.appendChild(p);
                } else if (release_type == "EP") {
                    ep_display.appendChild(p);
                } else if (release_type == "Single") {
                    single_display.appendChild(p);
                }
                 

                
            }
            //
            // await sleep(1000)
            // for (const album of result) {
            //     const id = album.id;
            //
            //     const song = await getReleaseGroupInfo(id);
            //
            //     console.log(song);
            //
            //     await sleep(1000);
            //
            //
            // };

            // result.forEach((album) => {
            //     const albumMBID = album.id;
            //
            //     const img = document.createElement("img");
            //
            //     img.onerror = () => {
            //         img.src = "photos/404.jpg";
            //     };
            //
            //     img.src = `https://coverartarchive.org/release-group/${albumMBID}/front-250`;
            //     img.alt = "Album Cover";
            //
            //     display.appendChild(img);
            // });
        });
    });

async function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

async function searchArtist(artist) {
    const url = new URL("https://musicbrainz.org/ws/2/artist/");

    url.searchParams.set("query", artist);
    url.searchParams.set("fmt", "json");
    url.searchParams.set("limit", "10");
    url.searchParams.set("inc", "url-rels");

    const response = await fetch(url, {
        headers: {
            "User-Agent": "ArtistSongFinder/1.0 (ultimatebeige@gmail.com)",
            Accept: "application/json",
        },
    });

    if (!response.ok) {
        const error = await response.text();
        console.error("Status:", response.status);
        console.error("Response:", error);
        throw new Error(error);
    }

    const data = await response.json();
    return data.artists;
}

async function searchAlbums(artistId, numAlbums) {
    const url = new URL("https://musicbrainz.org/ws/2/release-group/");

    url.searchParams.set("artist", artistId);
    url.searchParams.set("fmt", "json");
    url.searchParams.set("limit", `${numAlbums}`);

    const response = await fetch(url, {
        headers: {
            "User-Agent": "ArtistSongFinder/1.0 (ultimatebeige@gmail.com)",
            Accept: "application/json",
        },
    });

    if (!response.ok) {
        const error = await response.text();
        console.error("Status:", response.status);
        console.error("Response:", error);
        throw new Error(error);
    }

    const data = await response.json();

    return data["release-groups"];
}

async function getAlbumCover(mbid) {
    const url = `https://coverartarchive.org/release-group/${mbid}/front-250`;

    const response = await fetch(url);

    if (response.status === 404) {
        return null;
    }

    if (!response.ok) {
        throw new Error(`Coverartarchive status error: ${response.status}`);
    }

    const data = await response.json();
    return data;
}

async function getReleaseGroupInfo(mbid) {
    const url = new URL(`https://musicbrainz.org/ws/2/release-group/${mbid}`);

    url.searchParams.set("fmt", "json");
    url.searchParams.set("inc", "url-rels");

    const response = await fetch(url, {
        headers: {
            "User-Agent": "ArtistSongFinder/1.0 (ultimatebeige@gmail.com)",
            Accept: "application/json",
        },
    });

    if (!response.ok) {
        const error = await response.text();
        console.error("Status:", response.status);
        console.error("Response:", error);
        throw new Error(error);
    }

    const data = await response.json();

    return data;
}
