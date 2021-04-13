<script>
    import { onMount } from "svelte";

    export var sessionToken;
    export var profileData;
    let changed = false;
    let showSaved = false;
    function getRandomInt(max) {
        return Math.floor(Math.random() * max);
    }
    let form = document.getElementById("pfp");
    function canvasLoaded() {
        var img = new Image();
        img.onload = draw;
        img.onerror = failed;
        if (profileData.sub == "") {
            setTimeout(() => {
                img.src =
                    "./images/" +
                    profileData.sub +
                    ".jpeg?v=" +
                    getRandomInt(10000);
            }, 500);
        } else {
            img.src =
                "./images/" +
                profileData.sub +
                ".jpeg?v=" +
                getRandomInt(10000);
        }
    }
    onMount(canvasLoaded);
    function imageUploadChange(e) {
        var img = new Image();
        img.onload = draw;
        img.onerror = (e) => failed(e);
        img.src = URL.createObjectURL(this.files[0]);
        changed = true;
    }
    function draw() {
        var canvas = document.getElementById("canvas");
        var ctx = canvas.getContext("2d");
        let new_width =
            this.height >= this.width
                ? canvas.width
                : (this.width / this.height) * canvas.width;
        let new_height =
            this.width >= this.height
                ? canvas.height
                : (this.height / this.width) * canvas.height;
        let x_offset =
            this.height >= this.width ? 0 : -0.5 * (new_width - new_height);
        let y_offset =
            this.width >= this.height ? 0 : -0.5 * (new_height - new_width);
        ctx.drawImage(this, x_offset, y_offset, new_width, new_height);
    }
    function failed(e) {
        console.error("The provided file couldn't be loaded as an Image media");
    }
    function sendImage(token) {
        return function (blob) {
            let formData = new FormData();
            formData.append("file", blob);
            fetch("./profile_image?token=" + token, {
                method: "POST",
                body: formData,
            })
                .then((response) => response.text())
                .then((data) => {
                    console.log(data);
                    showSaved = true;
                    console.log(showSaved);
                    setTimeout(() => (showSaved = false), 3000);
                });
        };
    }
    function formSubmit(event) {
        event.preventDefault();
        if (changed) {
            changed = false;
            let canvas = document.getElementById("canvas");
            let ctx = canvas.getContext("2d");
            console.log("evecat");
            canvas.toBlob(sendImage(sessionToken), "image/jpeg", 0.8);
        }
    }
</script>

<main>
    <form
        class="col-12 col-mx-auto"
        id="pfp"
        target="/"
        method="post"
        enctype="multipart/form-data"
        on:submit={formSubmit}
    >
        <label for="image"
            ><canvas id="canvas" width="256" height="256" on:show={canvasLoaded}
                >...</canvas
            >
        </label>

        <input
            style="display:none"
            id="image"
            type="file"
            name="file"
            accept="image/*"
            on:change={imageUploadChange}
        />
        {#if changed}
            <button class="btn button-secondary" type="submit">Save</button>
        {/if}
        {#if showSaved}
            <span class="text-gray">Saved</span>
        {/if}
    </form>
</main>

<style>
    #canvas {
        border-radius: 50%;
        box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.6);
        -moz-box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.6);
        -webkit-box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.6);
        -o-box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.6);
    }
</style>
