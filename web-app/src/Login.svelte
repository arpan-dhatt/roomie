<script>
    import { error } from "node:console";

    export var signedIn;
    export var page;
    export var sessionToken;
    let errorMessage = null;
    window.onSignIn = (googleUser) => {
        const profile = googleUser.getBasicProfile();
        console.log("ID: " + profile.getId());
        console.log("Image URL: " + profile.getImageUrl());
        console.log("Email: " + profile.getEmail());
        console.log("ID Token: " + googleUser.getAuthResponse().id_token);
        fetch("./auth", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                oauth_token_id: googleUser.getAuthResponse().id_token,
            }),
        })
            .then((response) => response.json())
            .then((data) => {
                console.log(data);
                if (data.error != null) {
                    errorMessage = data.error;
                    window.signOut();
                } else {
                    page = localStorage.getItem("page")
                        ? localStorage.getItem("page")
                        : "profile";
                    sessionToken = data.jwt_token;
                    signedIn = true;
                    errorMessage = null;
                    //window.getStudentData(sessionToken);
                }
            });
    };
</script>

<main>
    <div class="columns">
        <div class="column col-8 col-md-12 col-mx-auto">
            <h3>A place to find a roommate for college!</h3>
        </div>
    </div>
    <div class="columns">
        <p class="column col-8 col-mx-auto">
            This is a digital service where you can find other students going to
            the same college and looking for roommates. After signing in and
            entering your information (you can edit it later), you can look at
            profiles of other students and get in contact with them.
        </p>
    </div>
    <div class="columns">
        <p class="column col-8 col-md-12 col-mx-auto">
            You can get started by signing in with Google! You don't need a
            school account to enter.
        </p>
    </div>
    <div class="columns">
        {#if errorMessage != null}
            <p class="column col-8 col-mx-auto" style="color: red;">
                {errorMessage}
            </p>
        {/if}
        <div
            style="display:flex; justify-content: center;"
            class="column col-8 col-mx-auto g-signin2"
            data-onsuccess="onSignIn"
        />
    </div>
</main>
