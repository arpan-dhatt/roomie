<script>
    import ProfileImageSelector from "./ProfileImageSelector.svelte";

    export var profileData;
    export var whenDone;
    export var sessionToken;

    let genderOptions = [
        "Select",
        "Male",
        "Female",
        "Transgender",
        "Non-Binary",
        "Other",
        "Prefer not to respond",
    ];
    let collegeOptions = [
        "Select",
        "School of Architecture",
        "McCombs School of Business",
        "Moody College of Communication",
        "College of Education",
        "Cockrell School of Engineering",
        "College of Fine Arts",
        "Jackson School of Geosciences",
        "School of Information",
        "College of Liberal Arts",
        "College of Natural Science",
        "School of Nursing",
        "College of Pharmacy",
        "Steve Hicks School of Social Work",
        "School of Undergraduate Studies",
    ];
    let classYearOptions = [2026, 2025, 2024, 2023, 2022, 2021, 2020];
    let locationOptions = ["Select", "On-Campus", "Off-Campus"];
</script>

<main>
    <div class="columns">
        <div class="column col-8 col-md-12 col-mx-auto">
            <h1>Edit Your Profile</h1>
        </div>
    </div>
    <ProfileImageSelector sessionToken={sessionToken} profileData={profileData}></ProfileImageSelector>
    <div class="columns">
        <div class="column col-8 col-md-12 col-mx-auto">
            <p>
                This is where you build the profile other students will see
                after they sign in. You can modify it later by pressing the
                "Profile" button that will appear on the top right of the page
                when you're done. However, it's best to put in the correct
                information as soon as you can.
            </p>
        </div>
        <div class="column col-8 col-md-12 col-mx-auto">
            <div class="form-group">
                <div class="columns">
                    <div class="column col-6 col-sm-12">
                        <label class="form-label" for="first-name"
                            >Preferred First Name</label
                        >
                        <input
                            type="text"
                            class="form-input"
                            id="first-name"
                            bind:value={profileData.first_name}
                        />
                    </div>
                    <div class="column col-6 col-sm-12">
                        <label class="form-label" for="last-name">
                            Last Name</label
                        >
                        <input
                            type="text"
                            class="form-input"
                            id="last-name"
                            bind:value={profileData.last_name}
                        />
                    </div>
                </div>
                <div class="columns">
                    <div class="column col-6 col-sm-12">
                        <label class="form-label" for="gender">Gender</label>
                        <!-- <input
                            type="text"
                            class="form-input"
                            id="first-name"
                            bind:value={profileData.first_name}
                        /> -->
                        <select
                            class="form-select"
                            id="gender"
                            bind:value={profileData.gender}
                        >
                            {#each genderOptions as genderOption}
                                <option value={genderOption}
                                    >{genderOption}</option
                                >
                            {/each}
                        </select>
                    </div>
                    <div class="column col-6 col-sm-12">
                        <label class="form-label" for="class-year"
                            >Class Year</label
                        >
                        <select
                            class="form-select"
                            id="class-year"
                            bind:value={profileData.class}
                        >
                            {#each classYearOptions as classYearOption}
                                <option value={classYearOption}
                                    >{classYearOption}</option
                                >
                            {/each}
                        </select>
                    </div>
                </div>
                <div class="columns" style="margin-top: 20px">
                    <div class="column col-6 col-sm-12">
                        <label class="form-label" for="college">College</label>
                        <select
                            class="form-select"
                            id="college"
                            bind:value={profileData.college}
                        >
                            {#each collegeOptions as collegeOption}
                                <option value={collegeOption}
                                    >{collegeOption}</option
                                >
                            {/each}
                        </select>
                    </div>
                    <div class="column col-6 col-sm-12">
                        <label class="form-label" for="Major">Major</label>
                        <input
                            type="text"
                            class="form-input"
                            id="major"
                            bind:value={profileData.major}
                        />
                    </div>
                </div>
                <div class="columns" style="margin-top: 20px;">
                    <div class="col-12">
                        <h3>Bio</h3>
                    </div>
                    <div class="col-12">
                        <p>
                            What do you like to do in your free time? What
                            organizations do you want to be a part of at UT? Any
                            Clubs? Greek Life? Video Games? Sports? What time do
                            you like going to sleep? Anything you think a future
                            roommate at UT would want to know, write it here!
                            Write as much as you can so the search engine can
                            pick it up!
                        </p>
                    </div>
                    <div class="col-12 text-left">
                        <div class="form-group">
                            <textarea
                                class="form-input"
                                id="bio"
                                placeholder="Bio here..."
                                rows="6"
                                bind:value={profileData.bio}
                            />
                        </div>
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
                            what you enter. Feel free to leave any of these
                            blank, but you should have at least one way for a
                            prospective roommate to contact you!
                        </p>
                    </div>
                    <div class="column col-6 col-sm-12">
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
                    <div class="column col-6 col-sm-12">
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
                    <div class="column col-6 col-sm-12">
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
                    <div class="column col-6 col-sm-12">
                        <label class="form-label" for="insta-contact"
                            >Instagram Profile</label
                        >
                        <input
                            type="text"
                            class="form-input"
                            id="insta-contact"
                            placeholder="elonmusk"
                            bind:value={profileData.instagram}
                        />
                    </div>
                    <div class="column col-6 col-sm-12">
                        <label class="form-label" for="facebook-contact"
                            >Facebook Profile</label
                        >
                        <input
                            type="text"
                            class="form-input"
                            id="facebook-contact"
                            placeholder="zuck"
                            bind:value={profileData.facebook}
                        />
                    </div>
                    <div class="column col-6 col-sm-12">
                        <label class="form-label" for="twitter-contact"
                            >Twitter Profile</label
                        >
                        <input
                            type="text"
                            class="form-input"
                            id="twitter-contact"
                            placeholder="elonmusk"
                            bind:value={profileData.twitter}
                        />
                    </div>
                    <div class="column col-6 col-sm-12">
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
                    <div class="column col-6 col-sm-12">
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
                    <div class="col-12">
                        <h3>Housing Information</h3>
                    </div>
                    <div class="column col-12">
                        <label class="form-label" for="location"
                            >Location</label
                        >
                        <select
                            class="form-select"
                            id="location"
                            bind:value={profileData.location}
                        >
                            {#each locationOptions as locationOption}
                                <option value={locationOption}
                                    >{locationOption}</option
                                >
                            {/each}
                        </select>
                    </div>
                </div>
                <div class="columns" style="margin-top: 20px">
                    <div class="col-12">
                        <label for="building-preferences">Prefers to...</label>
                        <input type="text" class="form-input" placeholder="live in north campus..." bind:value={profileData.building_preferences}>
                    </div>
                </div>
                <div class="columns" style="margin-top: 20px">
                    <div class="column col-12">
                        <button
                            class="btn btn-primary"
                            on:click={() => {
                                whenDone(sessionToken, profileData);
                            }}>Save</button
                        >
                    </div>
                </div>
            </div>
        </div>
    </div>
</main>

<style>
</style>
