<script>
    export var studentData;
    export var sessionToken;

    let text = "";
    function filterStudents(e) {
        e.preventDefault();
        let query = "./student?token=" + sessionToken;
        if (text != "") {
            query += "&query=" + text;
        }
        fetch(query)
            .then((response) => response.json())
            .then((data) => {
                if (data != null) {
                    studentData = data;
                }
            });
    }
</script>

<main>
        <form on:submit={filterStudents} class="columns col-gapless">
            <div class="column col-10 col-sm-12">
                <input
                    placeholder="Search for anything like gender, class year, major college, interests, etc..."
                    style="width: 100%;"
                    type="text"
                    bind:value={text}
                />
            </div>
            <div class="column col-2 col-sm-12">
                <button
                    style="width: 100%;"
                    class="btn btn-primary"
                    on:click={() => filterStudents()}>Search</button
                >
            </div>
            </form>
</main>

<style>
    .column {
        padding: 10px;
    }
</style>
