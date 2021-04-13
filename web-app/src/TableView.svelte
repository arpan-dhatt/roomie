<script>
    import MoreInfoModal from "./MoreInfoModal.svelte";
    import SearchBar from "./SearchBar.svelte";
    export var studentData;
    export var sessionToken;
    function getRandomInt(max) {
        return Math.floor(Math.random() * max);
    }
    const colorMap = {
        Honors: "green",
        "Non-Honors": "blue",
        "Not Applicable": "red",
        "On-Campus": "purple",
        "Off-Campus": "pink",
        "Shared Room and Bathroom": "green",
        "Connected Bathroom": "blue",
        "Communal Bathroom": "pink",
        "Private Bathrooms": "purple",
        Other: "red",
    };
    function loadMore(text) {
        let query = "./student?token=" + sessionToken;
        if (text != "") {
            query += "&query=" + text;
        }
        query += "&offset="+studentData.students.length;
        console.log(query)
        fetch(query)
            .then((response) => response.json())
            .then((data) => {
                console.log(data)
                if (data != null) {
                    studentData.students = [...studentData.students, ...data.students];
                }
            });

    }
    var modalOpen = false;
    var modalData = {};
    var search_text = "";
</script>

<main>
    <MoreInfoModal bind:open={modalOpen} {modalData} {colorMap} />
    <SearchBar bind:studentData {sessionToken} bind:text={search_text}/>
    <div class="columns col-gapless">
        {#each studentData.students as student}
            <div class="column col-3 col-sm-12 col-md-6 col-lg-4 col-xl-3">
                <div class="card" style="padding: 10px; margin: 10px;">
                    <div class="card-image">
                        <img
                                class="img-responsive"
                                src={"./images/" + student.sub + ".jpeg?v="+getRandomInt(10000)}
                                alt=""
                                style="margin: 0 auto;"
                                width="256px"
                                height="256px"
                            />
                    </div>
                    <div class="card-header">
                        <div class="card-title h2 first-name">
                            {student.first_name}
                        </div>
                        <div class="card-title text-gray">
                            {student.gender + " | Class of " + student.class}
                        </div>
                    </div>
                    <div class="card-body">
                        {#if student.college != "Select"}
                            <p>🏫<strong>{student.college}</strong></p>
                        {/if}
                        {#if student.major != ""}
                            <p>📚<strong>{student.major}</strong></p>
                        {/if}
                        {#if student.location != "Select"}
                            <p>📍<strong>{student.location}</strong></p>
                        {/if}
                        <button
                            class="btn btn-primary"
                            style="margin-top: 10px; width: 100%;"
                            on:click={() => {
                                modalData = student;
                                modalOpen = true;
                            }}>Profile</button
                        >
                    </div>
                </div>
            </div>
        {/each}
        {#if studentData.students.length == 0}
            <p>
                Try being less specific or if you're typing things like "class
                year of 2025", just use "2025" instead.
            </p>
        {/if}
    </div>
    <div class="columns" style="margin-bottom: 200px;">
        <div class="column col-12">
            {#if studentData.students.length % 12 == 0}
            <button class="btn btn-primary" on:click={() => loadMore(search_text)}>Load More</button>
            {/if}
        </div>
    </div>
</main>

<style>
    .red {
        background-color: red;
        color: white;
    }
    .green {
        background-color: green;
        color: white;
    }
    .blue {
        background-color: blue;
        color: white;
    }
    .pink {
        background-color: orchid;
        color: white;
    }
    .purple {
        background-color: blueviolet;
        color: white;
    }
    img {
        border-radius: 50% !important;
    }
    .first-name {
        color: rgb(56, 165, 255);
        font-weight: 650;
    }
    p {
        margin-bottom: 0;
    }
</style>
