<script>
    export var signedIn;
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
            You can get started by signing in with Google! You don't need a school account to enter.
        </p>
    </div>
    <div class="columns">
        <div style="display:flex; justify-content: center;" class="column col-8 col-mx-auto g-signin2" data-onsuccess="onSignIn" />
    </div>
</main>
