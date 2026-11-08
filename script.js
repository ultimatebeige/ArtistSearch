// Disclosure:
// AI was used to understand the api endpoints
// but the final js and html was written by me

document
    .getElementById("artist-form")
    .addEventListener("submit", async function (event) {
        event.preventDefault();
        $("#error-display").text("");
        const search_term = $("#form-input-artist").val();
        const artists = await searchArtist(search_term);

        $("#artist-display")
            .find("button")
            .each(function () {
                $(this).remove();
            });

        for (let artist of artists) {
            const id = artist.id;
            const name = artist.name;
            console.log(artist.name);
            var btn = $("<button>")
                .text(name)
                .addClass("artist-button")
                .on("click", function () {
                    $("#error-display").text("");
                    updateReleasesId(id);
                });
            $("#artist-display").append(btn);
        }

        console.log(artists);
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
        $("#error-display").text(error);
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
        let errDisplay = $("#error-display");
        if (response.status == 404) {
            errDisplay.text("Error: Artist Not Found");
        } else if (response.status == 400) {
            errDisplay.text("Error: Malformed request");
        } else if (response.status == 503) {
            errDisplay.text(
                "Error: Too many requests, wait a second before trying again",
            );
        } else {
            errDisplay("Error:" + error);
        }
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

async function updateReleasesId(mbid) {
    searchAlbums(mbid, 50).then(async (result) => {
        const display = $("#release-display");
        const album_display = $("#album-display");
        const ep_display = $("#ep-display");
        const single_display = $("#single-display");
        
        album_display.hide();
        ep_display.hide();
        single_display.hide();
        // display.replaceChildren();
        display.find(".release-container").each(function () {
            $(this).remove();
        });

        console.log(result);

        for (const release of result) {
            const release_type = release["primary-type"];
            const release_name = release.title;
            const release_id = release.id;

            var div = $("<div></div>").addClass("release-container");

            var p = $("<p></p>").text(release_name);
            div.append(p);

            var img = $("<img>")
                .attr({
                    src: `https://coverartarchive.org/release-group/${release_id}/front-250`,
                    alt: `${release_name} cover art`,
                })
                .on("error", function () {
                    $(this).off("error");
                    $(this).attr("src", "photos/404.jpg");
                });

            div.append(img);
            

            if (release_type == "Album") {
                album_display.append(div);
            } else if (release_type == "EP") {
                ep_display.append(div);
            } else if (release_type == "Single") {
                single_display.append(div);
            }
        }
    });
}
