<script>
    export var open;
    export var modalData;
    export var colorMap;
</script>

<main>
    <div class={"modal " + (open ? "active" : "")} id="modal-id">
        <div
            class="modal-overlay"
            aria-label="Close"
            on:click={() => {
                open = false;
            }}
        />
        <div class="modal-container">
            <div class="modal-header">
                <div
                    class="btn btn-clear float-right"
                    aria-label="Close"
                    on:click={() => {
                        open = false;
                    }}
                />
            </div>
            <div class="modal-body">
                <div class="content text-left">
                    {#if modalData}
                        <div class="columns" style="margin-bottom: 10px;">
                            <div class="column col-4 col-sm-12">
                                <img
                                    class="img-responsive"
                                    src={"./images/" + modalData.sub + ".jpeg"}
                                    alt=""
                                />
                            </div>
                            <div class="column col-8 col-sm-12">
                                <h2 class="first-name">
                                    {modalData.first_name}
                                    {modalData.last_name}
                                </h2>
                                <h6>
                                    {modalData.gender} | Class of {modalData.class}
                                </h6>
                                {#if modalData.college != "Select"}<h6>
                                        ⛪️{modalData.college}
                                    </h6>{/if}
                                {#if modalData.major != ""}<h6>
                                        📚{modalData.major}
                                    </h6>{/if}
                                {#if modalData.location != "Select"}<h6>
                                        📍{modalData.location}
                                    </h6>{/if}
                                {#if modalData.building_preferences != ""}
                                    <h6>
                                        Prefers to {modalData.building_preferences}
                                    </h6>
                                {/if}
                            </div>
                        </div>
                        <p
                            style="border: 1px solid gray; border-radius: 15px; padding: 10px;"
                        >
                            {modalData.bio}
                        </p>
                        <h5>Contact Information</h5>
                        <ul>
                            {#if modalData.discord != ""}<li>
                                    {"Discord: " + modalData.discord}
                                </li>{/if}
                            {#if modalData.linkedin != ""}<li>
                                    {"LinkedIn: " + modalData.linkedin}
                                </li>{/if}
                            {#if modalData.snapchat != ""}<li>
                                    {"SnapChat: " + modalData.snapchat}
                                </li>{/if}
                            {#if modalData.instagram != ""}<li>
                                    {"Instagram: " + modalData.instagram}
                                </li>{/if}
                            {#if modalData.facebook != ""}<li>
                                    {"Facebook: " + modalData.facebook}
                                </li>{/if}
                            {#if modalData.twitter != ""}<li>
                                    {"Twitter: " + modalData.twitter}
                                </li>{/if}
                            {#if modalData.email != ""}<li>
                                    {"Email: " + modalData.email}
                                </li>{/if}
                            {#if modalData.phone != ""}<li>
                                    {"Phone: " + modalData.phone}
                                </li>{/if}
                        </ul>
                    {/if}
                </div>
            </div>
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
        border-radius: 50%;
        margin: 0 auto;
    }
    .first-name {
        color: rgb(56, 165, 255);
        font-weight: 650;
    }
</style>
