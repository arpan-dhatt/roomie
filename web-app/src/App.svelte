<script>
	import DataForm from "./DataForm.svelte";
	import Login from "./Login.svelte";
	import SignOut from "./SignOut.svelte";
	import TableView from "./TableView.svelte";

	let signedIn = null;
	let sessionToken = "";
	let page = "signin";
	var template = {
		first_name: "",
		last_name: "",
		college_name: "",
		discord: "",
		linkedin: "",
		snapchat: "",
		instagram: "",
		facebook: "",
		twitter: "",
		email: "",
		phone: "",
		honors: [],
		location: [],
		floorplan: [],
		additional: "",
	};

	var profileData = template;
	var studentData = {
		students: [
			{
				first_name: "Barack",
				last_name: "Obama",
				college_name:
					"UT Austin, University of Texas Austin, University of Texas at Austin",
				honors: ["Honors", "Non-Honors"],
				location: ["On-Campus"],
				floorplan: [
					"Shared Room and Bathroom",
					"Connected Bathroom",
					"Private Bathrooms",
					"Communal Bathroom",
				],
			},
			{
				first_name: "Donaldino",
				last_name: "Trumperino",
				college_name: "A&M",
				honors: ["Honors", "Non-Honors"],
				location: ["On-Campus"],
				floorplan: [
					"Shared Room and Bathroom",
					"Connected Bathroom",
					"Private Bathrooms",
				],
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
					console.log(data)
					studentData = data
					profileData = data.current_student
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
			<TableView studentData={studentData} />
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
