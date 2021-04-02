<script>
import MoreInfoModal from './MoreInfoModal.svelte'
export var studentData;
const colorMap = {
    "Honors": "green",
    "Non-Honors": "blue",
    "Not Applicable": "red",
    "On-Campus": "purple",
    "Off-Campus": "pink",
    "Shared Room and Bathroom": "green",
    "Connected Bathroom": "blue",
    "Communal Bathroom": "pink",
    "Private Bathrooms": "purple",
    "Other": "red"
}

var modalOpen = false
var modalData={}
</script>

<main>
    <MoreInfoModal bind:open={modalOpen} modalData={modalData} colorMap={colorMap}/>
    <div class="columns">
        <div class="column col-12 col-mx-auto">
            <table class="table table-striped">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>College Name</th>
                        <th>Honors Housing</th>
                        <th>Locations</th>
                        <th>Room Floorplans</th>
                        <th>More</th>
                    </tr>
                </thead>
                <tbody>
                    {#if studentData != null}
                    {#each studentData.students as student}
                    <tr>
                        <td class="tooltip" data-tooltip={student.first_name+" "+student.last_name}>{student.first_name.slice(0,27)+(student.first_name.length > 27 ? "... " : " ")+student.last_name.slice(0,27)+(student.last_name.length > 27 ? "... " : " ")}</td>
                        <td class="tooltip" data-tooltip={student.college_name}>{student.college_name.slice(0,27)+(student.college_name.length > 27 ? "..." : "")}</td>
                        <td>
                            {#each student.honors as honor}
                                <span class={"chip "+colorMap[honor]}>{honor}</span>
                            {/each}
                        </td>
                        <td>
                            {#each student.location as location}
                                <span class={"chip "+colorMap[location]}>{location}</span>
                            {/each}
                        </td>
                        <td>
                            {#each student.floorplan as floorplan}
                                <span class={"chip "+colorMap[floorplan]}>{floorplan}</span>
                            {/each}
                        </td>
                        <td>
                            <button class="btn btn-primary s-circle" on:click={() =>{modalData=student; modalOpen = true}}><i class="icon icon-more-horiz"></i></button>
                        </td>
                    </tr>
                    {/each}
                    {/if}
                </tbody>
            </table>
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