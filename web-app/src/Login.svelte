<script>
    import App from "./App.svelte";

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
    <div class="columns heading">
        <div class="column col-8 col-md-10 col-sm-12 col-mx-auto">
            <h2>A roommate finding service by UT students* for UT students</h2>
        </div>
    </div>
    <div class="columns" style="margin-top: 25px;">
        <div class="column col-4 col-md-6 col-sm-8 col-mx-auto">
            <h3>Login using your UTexas Email! Longhorns only!</h3>
        </div>
    </div>
    <div class="columns">
        <div class="column col-3 col-mx-auto"><h3>👇🏼</h3></div>
    </div>
    <div class="columns">
        {#if errorMessage != null}
            <p class="column col-8 col-md-12 col-mx-auto" style="color: red;">
                {errorMessage}
            </p>
        {/if}
        <div
            style="display:flex; justify-content: center;"
            class="column col-8 col-mx-auto g-signin2"
            data-onsuccess="onSignIn"
        />
    </div>
    <div class="columns" style="margin-top: 20px;">
        <div class="column col-10 col-mx-auto">
            <p class="text-gray">
                If you're an incoming freshman, <a
                    href="https://get.utmail.utexas.edu/">go to UT's website</a
                > to get one using your UT EID.
            </p>
        </div>
    </div>
    <div class="columns" style="margin-top: 40px;">
        <div class="column col-8 col-md-10 col-sm-12 col-mx-auto">
            <h3>Get started in three...two...done!</h3>
        </div>
    </div>
    <div class="columns">
        <div class="column col-4  col-sm-10 col-mx-auto">
            <h4>Step 1</h4>
            <p style="margin:10%;">
                <strong
                    >Sign in and create your profile! Add a profile picture,
                    your major, college, bio, your living preferences and
                    anything else you'd like to say. The more you tell a
                    possible roommate about yourself, the more likely you are to
                    get a good fit!</strong
                >
            </p>
        </div>
        <div class="column col-6  col-sm-12 col-mx-auto">
            <img src="./step-1.jpg" alt="" class="img-responsive" />
        </div>
    </div>
    <div class="columns">
        <div class="column col-4 col-sm-10 col-mx-auto">
            <h4>Step 2</h4>
            <p style="margin:10%;">
                <strong
                    >Use the integrated search engine to quickly and easily find
                    a roommate. Search by class year, gender, major, college,
                    interests, anything. You'll receive a result in a fraction
                    of a second!</strong
                >
            </p>
        </div>
        <div class="column col-6  col-sm-12 col-mx-auto">
            <img
                src="./step-2a.jpg"
                alt=""
                class="img-responsive"
                style="padding: 2%;"
            />
            <img
                src="./step-2b.jpg"
                alt=""
                class="img-responsive"
                style="padding: 5%;"
            />
            <img src="./step-2c.jpg" alt="" class="img-responsive" />
        </div>
    </div>
    <div class="columns" style="margin-top: 20px;">
        <div class="column col-6 col-md-12 col-mx-auto">
            <h4>And That's It</h4>
            <p>
                If you want to know more about me and the motivation behind this
                project, look below.
            </p>
        </div>
    </div>
    <div
        class="columns"
        style="margin-top: 20px; padding-left: 3rem; padding-right: 3rem;"
    >
        <div class="column col-6 col-md-12 col-mx-auto">
            <h4>Who and Why?</h4>
            <p>
                Hello! My name is Arpan, and I'm an incoming freshman majoring
                in Computer Science. I'm the guy in the picture above. As you
                can tell, I love programming and working on projects in my free
                time.
            </p>
            <p>
                I decided to make this site because I didn't like the other
                options UT students had to find roommates, especially for people
                who are new to the community, like me. RoomSurf looked good at
                first, but it's not easy to narrow down the search and profiles
                are openly visible to everyone. The Facebook group looked like
                the other best option, especially since only students could
                enter, but it lacked the benefits of RoomSurf. What if there was
                something that combined the best of both worlds? Wait...Roomie
                does...at least I hope so!
            </p>
            <p>
                For fellow CS nerds, this project is open-source and the code is
                available in <a href="https://github.com/arpan-dhatt/roomie"
                    >this GitHub Repo</a
                >. If you'd like to contribute, let me know and I can catch you
                up!
            </p>
            <p>
                <strong
                    >I take user privacy very seriously, but if you're concerned about your privacy, here's a quick
                    rundown:</strong
                >
            </p>
            <ol style="text-align: left;">
                <li>
                    This data is stored securely and never, ever shared with any
                    third party.
                </li>
                <li>
                    We will never spam you with emails. In fact, we don't even
                    store the email address you sign up with unless it's in the
                    contacts which you explicitly list.
                </li>
                <li>If you want to delete your data from the platform, you can do it instantly and easily.</li>
            </ol>
        </div>
    </div>

    <div class="columns" style="margin-top:50px;">
        <div class="column col-10 col-mx-auto">
            <p class="text-gray">
                * I am a UT student, but this website is NOT supported or
                endorsed by the University of Texas
            </p>
        </div>
    </div>
</main>

<style>
    .heading {
        background-image: url("https://news.utexas.edu/wp-content/uploads/2020/09/Tower-from-CMB-2010-sunset5517-copy-scaled.jpg");
        background-size: cover;
        background-position: right;
        background-repeat: no-repeat;
        background-attachment: fixed;
        height: 80vh;
        padding: 25px;
    }
    h2 {
        font-size: 48px;
        background: -webkit-linear-gradient(#bf5700, #8b5122);
        -webkit-background-clip: text;
        background-clip: text;
        -webkit-text-fill-color: transparent;
    }
    h3 {
        font-size: 24px;
        background: -webkit-linear-gradient(#bf5700, #8b5122);
        -webkit-background-clip: text;
        background-clip: text;
        -webkit-text-fill-color: transparent;
    }
    h4 {
        margin-top: 10%;
        font-size: 36px;
        color: #bf5700;
        font-weight: 700;
    }
</style>
