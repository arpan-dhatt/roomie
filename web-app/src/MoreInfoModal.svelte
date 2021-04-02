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
                <div class="modal-title h5">
                    {modalData
                        ? modalData.first_name + " " + modalData.last_name
                        : ""}
                </div>
            </div>
            <div class="modal-body">
                <div class="content text-left">
                    {#if modalData}
                        <h6>{modalData.college_name}</h6>
                        <h5>Contact Information</h5>
                        <ul>
                            {#if modalData.discord != undefined }<li>{"Discord: " + modalData.discord}</li>{/if}
                            {#if modalData.linkedin != undefined }<li>{"LinkedIn: " + modalData.linkedin}</li>{/if}
                            {#if modalData.snapchat != undefined }<li>{"SnapChat: " + modalData.snapchat}</li>{/if}
                            {#if modalData.instagram != undefined }<li>{"Instagram: " + modalData.instagram}</li>{/if}
                            {#if modalData.facebook != undefined }<li>{"Facebook: " + modalData.facebook}</li>{/if}
                            {#if modalData.twitter != undefined }<li>{"Twitter: " + modalData.twitter}</li>{/if}
                            {#if modalData.email != undefined }<li>{"Email: " + modalData.email}</li>{/if}
                            {#if modalData.phone != undefined }<li>{"Phone: " + modalData.phone}</li>{/if}
                        </ul>
                        <h4>Room Information</h4>
                        <div class="container">
                            <div class="columns">
                                <div class="column col-3">
                                    <h6>Honors</h6>
                                    {#each modalData.honors ? modalData.honors : [] as honor}
                                        <span class={"chip " + colorMap[honor]}
                                            >{honor}</span
                                        >
                                    {/each}
                                </div>
                                <div class="column col-3">
                                    <h6>Locations</h6>
                                    {#each modalData.location ? modalData.location : [] as honor}
                                        <span class={"chip " + colorMap[honor]}
                                            >{honor}</span
                                        >
                                    {/each}
                                </div>
                                <div class="column col-3">
                                    <h6>Floorplans</h6>
                                    {#each modalData.floorplan ? modalData.floorplan : [] as honor}
                                        <span class={"chip " + colorMap[honor]}
                                            >{honor}</span
                                        >
                                    {/each}
                                </div>
                            </div>
                        </div>
                        <h4>Additional Information</h4>
                        <p style="border: 1px solid gray; border-radius: 15px; padding: 10px;">{modalData.additional}</p>
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
</style>
