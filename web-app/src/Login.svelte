<script>
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
                    window.getStudentData(sessionToken);
                }
            });
    };
</script>

<main>
    <div class="columns" style="margin-bottom: 20px;">
        <div class="column col-8 col-md-12 col-mx-auto">
            <h3>
                Welcome Longhorns! Roomie is a roommate finding service made by
                UT students* for UT students.
            </h3>
            <h4>
                Get started by signing in with Google! Make sure to use your
                utexas.edu email. If you're an incoming freshman, <a
                    href="https://get.utmail.utexas.edu/"
                    >go to the UT website</a
                > to get yours using your UT EID. It's the same ID you used to log
                into MyStatus!
            </h4>
        </div>
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
    <div class="columns" style="margin-top: 40px;">
        <div class="column col-8 col-mx-auto">
            <p>
                You can use this platform to find roommates at UT. After signing
                in, you can make a profile for yourself (editable at any time)
                and look at the profiles of other students to find the best
                roommate. Try to use the search feature to narrow down who
                you're looking for. If you want a roommate in the class of 2025,
                make sure you add "2025" to your search. You can search for
                students specific colleges, like the College of Natural Science
                or specific majors, like Neuroscience!
            </p>
            <p class="text-gray">
                *I am a UT student but this service is NOT officially endorsed
                by or supported by the University of Texas
            </p>
        </div>
    </div>
</main>
