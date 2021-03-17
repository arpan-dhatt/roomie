<script>
    export var page;
    export var signedIn;

    function signOutRequest() {
        var auth2 = gapi.auth2.getAuthInstance();
        auth2.signOut().then(function () {
            console.log('User signed out.');
            signedIn = false;
            location.reload()
        });
    }

    function signOut() {
        switchToPage("signin")
        signOutRequest()
    }

    function switchToPage(string) {
        page = string
    }
</script>

<main>
    <div class="topright">
        <button class="btn" on:click={() => switchToPage(page == "profile" ? "search" : "profile")}>{page == "profile" ? "Search" : "Profile"}</button>
        <button class="btn" on:click={signOut}>Sign Out</button>
    </div>
</main>

<style>
    .topright {
        position: fixed;
        top: 10px;
        right: 10px;
    }
</style>