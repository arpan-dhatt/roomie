<script>
	import DataForm from "./DataForm.svelte";
	import Login from "./Login.svelte";
	import SignOut from "./SignOut.svelte";
	import TableView from "./TableView.svelte";

	let signedIn = null;
	let sessionToken = "";
	let page = "signin";
	var template = {
		sub: "",
		first_name: "",
		last_name: "",
		gender: "Select",
		class: 2025,
		college: "Select",
		major: "",
		bio: "",
		discord: "",
		linkedin: "",
		snapchat: "",
		instagram: "",
		facebook: "",
		twitter: "",
		email: "",
		phone: "",
		location: "",
		building_preferences: "",
	};

	var profileData = template;
	var studentData = {
		students: [
			{
				sub: "",
				first_name: "Test First Name",
				last_name: "Test Last Name",
				gender: "Select",
				class: 2025,
				college: "Select",
				major: "",
				bio: "a bio...",
				discord: "",
				linkedin: "",
				snapchat: "",
				instagram: "",
				facebook: "",
				twitter: "",
				email: "",
				phone: "",
				location: "Select",
				building_preferences: "prefs"
			},
		],
	};
	$: {
		if (page != "signin") {
			localStorage.setItem("page", page);
		}
	}
	window.signOut = () => {
		var auth2 = gapi.auth2.getAuthInstance();
		auth2.signOut().then(function () {
			console.log("User signed out.");
			signedIn = false;
			page = "signin";
		});
	};

	function updateProfileData(sessionToken, profileData) {
		console.log("sending updated data");
		fetch("./student?token=" + sessionToken, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(profileData),
		})
			.then((response) => response.json())
			.then((data) => console.log(data));
	}

	window.getStudentData = (session_token) => {
		console.log(session_token);
		fetch("./student?token=" + session_token)
			.then((response) => response.json())
			.then((data) => {
				if (data != null) {
					console.log(data);
					studentData = data;
					profileData = data.current_student;
				}
			});
	};
</script>

<main>
	<div class="container">
		<div class="columns">
			<h1 class="column">Roomie</h1>
		</div>
		{#if page == "signin"}
			<Login bind:signedIn bind:sessionToken bind:page />
		{/if}
		{#if page == "profile"}
			<DataForm
				bind:profileData
				whenDone={updateProfileData}
				{sessionToken}
			/>
		{/if}
		{#if page == "search"}
			<TableView {studentData} />
		{/if}
		{#if page != "signin"}
			<SignOut bind:signedIn bind:page />
		{/if}
	</div>
</main>

<style>
	main {
		text-align: center;
		padding: 1em;
		max-width: 240px;
		margin: 0 auto;
	}

	h1 {
		color: #ff3e00;
		text-transform: uppercase;
		font-size: 4em;
		font-weight: 100;
	}

	@media (min-width: 0px) {
		main {
			max-width: none;
		}
	}
</style>
