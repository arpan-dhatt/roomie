<script>
    export var profileData
</script>

<main>
    <div class="columns">
        <div class="column col-8 col-mx-auto">
            <h1>Edit Your Profile</h1>
        </div>
        <div class="column col-8 col-mx-auto">
            <p>
                This is where you build the profile other students will see
                after they sign in. You can modify it later by pressing the
                "Profile" button that will appear on the top right of the page
                when you're done. However, it's best to put in the correct
                information as soon as you can.
            </p>
        </div>
        <div class="column col-8 col-mx-auto">
            <div class="form-group">
                <div class="columns">
                    <div class="column col-6 col-md-12">
                        <label class="form-label" for="first-name"
                            >Enter Your Preferred First Name</label
                        >
                        <input type="text" class="form-input" id="first-name" bind:value={profileData.first_name} />
                    </div>
                    <div class="column col-6 col-md-12">
                        <label class="form-label" for="last-name"
                            >Enter Your Last Name</label
                        >
                        <input type="text" class="form-input" id="last-name" bind:value={profileData.last_name} />
                    </div>
                </div>
                <div class="columns" style="margin-top: 20px;">
                    <div class="column col-12">
                        <label class="form-label" for="college-name"
                            >College Name</label
                        >
                        <input
                            type="text"
                            class="form-input"
                            id="college-name"
                            placeholder="UT Austin, University of Texas Austin, etc."
                            bind:value={profileData.college_name}
                        />
                        <p>
                            Add multiple, comma-separated names for easy
                            searchability since I'm too lazy to add an index of
                            colleges and stuff.
                        </p>
                    </div>
                </div>
                <div class="columns" style="margin-top: 20px">
                    <div class="col-12">
                        <h3>Contact Information</h3>
                    </div>
                    <div class="col-12">
                        <p>
                            Enter in contact information below. Remember, this
                            will be public available to everyone who signs into
                            the service, so make sure you're comfortable with
                            what you enter. Feel free to leave any, or all of
                            these blank, but having something is better than
                            nothing.
                        </p>
                    </div>
                    <div class="column col-6 col-md-12">
                        <label class="form-label" for="discord-contact"
                            >Discord Tag</label
                        >
                        <input
                            type="text"
                            class="form-input"
                            id="first-name"
                            placeholder="Username#0000"
                            bind:value={profileData.discord}
                        />
                    </div>
                    <div class="column col-6 col-md-12">
                        <label class="form-label" for="linkedin-contact"
                            >LinkedIn Profile</label
                        >
                        <input
                            type="url"
                            class="form-input"
                            id="linkedin-contact"
                            placeholder="https://www.linkedin.com/in/profile/"
                            bind:value={profileData.linkedin}
                        />
                    </div>
                    <div class="column col-6 col-md-12">
                        <label class="form-label" for="snapchat-contact"
                            >Snapchat</label
                        >
                        <input
                            type="text"
                            class="form-input"
                            id="snapchat-contact"
                            placeholder="something"
                            bind:value={profileData.snapchat}
                        />
                    </div>
                    <div class="column col-6 col-md-12">
                        <label class="form-label" for="insta-contact"
                            >Instagram Profile</label
                        >
                        <input
                            type="url"
                            class="form-input"
                            id="insta-contact"
                            placeholder="https://www.instagram.com/elonmusk/"
                            bind:value={profileData.instagram}
                        />
                    </div>
                    <div class="column col-6 col-md-12">
                        <label class="form-label" for="facebook-contact"
                            >Facebook Profile</label
                        >
                        <input
                            type="url"
                            class="form-input"
                            id="facebook-contact"
                            placeholder="https://www.facebook.com/zuck"
                            bind:value={profileData.facebook}
                        />
                    </div>
                    <div class="column col-6 col-md-12">
                        <label class="form-label" for="twitter-contact"
                            >Twitter Profile</label
                        >
                        <input
                            type="url"
                            class="form-input"
                            id="twitter-contact"
                            placeholder="https://twitter.com/elonmusk"
                            bind:value={profileData.twitter}
                        />
                    </div>
                    <div class="column col-6 col-md-12">
                        <label class="form-label" for="email-contact"
                            >Email</label
                        >
                        <input
                            type="email"
                            class="form-input"
                            id="email-contact"
                            placeholder="john.doe@gmail.com"
                            bind:value={profileData.email}
                        />
                    </div>
                    <div class="column col-6 col-md-12">
                        <label class="form-label" for="phone-contact"
                            >Phone Number</label
                        >
                        <input
                            type="tel"
                            class="form-input"
                            id="phone-contact"
                            placeholder="5555555555"
                            bind:value={profileData.phone}
                        />
                    </div>
                </div>
                <div class="columns" style="margin-top: 20px;">
                    <div class="column col-12">
                        <h3>Room Information</h3>
                    </div>
                    <div class="column col-12">
                        <p>
                            Select all options you are comfortable with and have
                            available to you. If you change your mind about
                            anything later, you can edit it here. If you have
                            specific preferences, such as 1st choice, 2nd
                            choice, you can add them in the additional details
                            section later.
                        </p>
                    </div>
                    <div class="column col-4 col-md-12 text-left">
                        <h5>Honors Housing</h5>
                        <label class="form-checkbox">
                            <input type="checkbox" name="honors" value={"Honors"} bind:group={profileData.honors} />
                            <i class="form-icon" /> Honors
                        </label>
                        <label class="form-checkbox">
                            <input type="checkbox" name="honors" value={"Non-Honors"} bind:group={profileData.honors} />
                            <i class="form-icon" /> Non-Honors
                        </label>
                        <label class="form-checkbox">
                            <input type="checkbox" name="honors" value={"Not Applicable"} bind:group={profileData.honors} />
                            <i class="form-icon" /> Not Applicable
                        </label>
                    </div>
                    <div class="column col-4 col-md-12 text-left">
                        <h5>Location</h5>
                        <label class="form-checkbox">
                            <input type="checkbox" name="location" value={"On-Campus"} bind:group={profileData.location} />
                            <i class="form-icon" /> On-Campus
                        </label>
                        <label class="form-checkbox">
                            <input type="checkbox" name="location" value={"Off-Campus"} bind:group={profileData.location} />
                            <i class="form-icon" /> Off-Campus
                        </label>
                        <label class="form-checkbox">
                            <input type="checkbox" name="location" value={"Not Applicable"} bind:group={profileData.location} />
                            <i class="form-icon" /> Not Applicable
                        </label>
                    </div>
                    <div class="column col-4 col-md-12 text-left">
                        <h5>Room Floorplan</h5>
                        <label class="form-checkbox">
                            <input type="checkbox" name="floorplan" value={"Shared Room and Bathroom"} bind:group={profileData.floorplan} />
                            <i class="form-icon" /> Shared Room and Bathroom
                        </label>
                        <label class="form-checkbox">
                            <input type="checkbox" name="floorplan" value={"Connected Bathroom"} bind:group={profileData.floorplan} />
                            <i class="form-icon" /> Connected Bathroom
                        </label>
                        <label class="form-checkbox">
                            <input type="checkbox" name="floorplan" value={"Communal Bathroom"} bind:group={profileData.floorplan} />
                            <i class="form-icon" /> Communal Bathroom
                        </label>
                        <label class="form-checkbox">
                            <input type="checkbox" name="floorplan" value={"Private Bathrooms"} bind:group={profileData.floorplan} />
                            <i class="form-icon" /> Private Bathrooms
                        </label>
                        <label class="form-checkbox">
                            <input type="checkbox" name="floorplan" value={"Not Applicable"} bind:group={profileData.floorplan} />
                            <i class="form-icon" /> Not Applicable
                        </label>
                    </div>
                </div>

                <div class="columns" style="margin-top: 20px;">
                    <div class="col-12">
                        <h3>Additional Information</h3>
                    </div>
                    <div class="col-12">
                        <p>
                            This is where you can add things like preferences or
                            other details that can't be added to the form. Add
                            as much detail as you want since this will also be
                            added to the search system and will help you find a
                            good roommate. If you have buildings you prefer, or
                            floorplans you'd like instead, make sure to add that
                            here, too!
                        </p>
                    </div>
                    <div class="col-12 text-left">
                        <div class="form-group">
                            <textarea
                                class="form-input"
                                id="input-example-3"
                                placeholder="Details..."
                                rows="6"
                                bind:value={profileData.additional}
                            />
                        </div>
                    </div>
                </div>
                <div class="columns" style="margin-top: 20px">
                    <div class="column col-12">
                        Press "Search" on the top right to save this information and look for other students
                    </div>
                </div>
            </div>
        </div>
    </div>
</main>

<style>
</style>
