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
                            <li>{"Discord: " + modalData.discord}</li>
                            <li>{"LinkedIn: " + modalData.linkedin}</li>
                            <li>{"SnapChat: " + modalData.snapchat}</li>
                            <li>{"Instagram: " + modalData.instagram}</li>
                            <li>{"Facebook: " + modalData.facebook}</li>
                            <li>{"Twitter: " + modalData.twitter}</li>
                            <li>{"Email: " + modalData.email}</li>
                            <li>{"Phone: " + modalData.phone}</li>
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
                                    {#each modalData.locations ? modalData.locations : [] as honor}
                                        <span class={"chip " + colorMap[honor]}
                                            >{honor}</span
                                        >
                                    {/each}
                                </div>
                                <div class="column col-3">
                                    <h6>Floorplans</h6>
                                    {#each modalData.floorplans ? modalData.floorplans : [] as honor}
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
