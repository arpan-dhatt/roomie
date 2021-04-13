<script>
    import MoreInfoModal from "./MoreInfoModal.svelte";
import SearchBar from "./SearchBar.svelte";
    export var studentData;
    export var sessionToken;
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

    var modalOpen = false;
    var modalData = {};
</script>

<main>
    <MoreInfoModal bind:open={modalOpen} {modalData} {colorMap} />
    <SearchBar bind:studentData={studentData} sessionToken={sessionToken} ></SearchBar>
    <div class="columns col-gapless">
        {#each studentData.students as student}
        <div class="column col-4 col-sm-12 col-md-6 col-lg-4">
            <div class="card" style="padding: 10px; margin: 10px;">
                <div class="card-image">
                    <img class="img-responsive" src={"./images/"+student.sub+".jpeg"} alt="" style="margin: 0 auto;">
                </div>
                <div class="card-header">
                    <div class="card-title h2 first-name">{student.first_name}</div>
                    <div class="card-title text-gray">{student.gender+" | Class of "+student.class}</div>
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
                    <button class="btn btn-primary" style="margin-top: 10px; width: 100%;" on:click={() => {
                        modalData = student;
                        modalOpen = true;
                    }}>Profile</button>
                </div>
            </div>
        </div>
        {/each}
        {#if studentData.students.length == 0}
        <p>Try being less specific or if you're typing things like "class year of 2025", just use "2025" instead. </p>
        {/if}
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
