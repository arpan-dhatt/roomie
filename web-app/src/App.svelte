<script>

	import DataForm from './DataForm.svelte';
	import Login from './Login.svelte';
	import SignOut from './SignOut.svelte';
	import TableView from './TableView.svelte';

	let signedIn = null;
	let sessionToken = "";
	let page = "signin";
	var template={
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
		additional: ""
	}
	
	var profileData = template;
	var studentData = {
		students: [
			{"first_name": "Barack", "last_name": "Obama", "college_name": "UT Austin, University of Texas Austin, University of Texas at Austin", "honors": ["Honors", "Non-Honors"], "locations": ["On-Campus"], "floorplans": ["Shared Room and Bathroom", "Connected Bathroom", "Private Bathrooms", "Communal Bathroom"]},
			{"first_name": "Donaldino", "last_name": "Trumperino", "college_name": "A&M", "honors": ["Honors", "Non-Honors"], "locations": ["On-Campus"], "floorplans": ["Shared Room and Bathroom", "Connected Bathroom", "Private Bathrooms"]}
		]
	}
	$: {
		if (page != "signin") {
			localStorage.setItem("page", page)
		}
	}
	window.onSignIn = (googleUser) => {
		const profile = googleUser.getBasicProfile();
		console.log('ID: ' + profile.getId());
		console.log('Image URL: ' + profile.getImageUrl());
		console.log('Email: ' + profile.getEmail());
		console.log('ID Token: ' + googleUser.getAuthResponse().id_token);
		signedIn = true
		page = localStorage.getItem("page") ? localStorage.getItem("page") : "profile"
		fetch("/auth/"+googleUser.getAuthResponse().id_token)
			.then(response => response.json())
			.then(data => {
				sessionToken = data.session_token
				profileData = data.profile_data ? data.profile_data : template
				getNewTableData(sessionToken)
			})
	};
	window.signOut = () => {
		var auth2 = gapi.auth2.getAuthInstance();
		auth2.signOut().then(function () {
			console.log('User signed out.');
			signedIn = false
			page = "signin"
		});
	}

	function updateProfileData(sessionToken, profileData) {
		fetch("/updateProfile", {
			method: "POST",
			mode: "CORS",
			cache: "no-cache",
			credentials: "same-origin",
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({session_token: sessionToken, profile_data: profileData})
		})
		.then(response => response.json())
		.then(data => console.log(data))
	}

	function getNewTableData(session_token) {
		fetch("/getTable/"+session_token)
		.then(response => response.json())
		.then(data => studentData = data)
	}
</script>

<main>
	<div class="container">
		<div class="columns">
			<h1 class="column">Roomie</h1>
		</div>
		{#if page == "signin"}
		<Login bind:signedIn={signedIn} />
		{/if}
		{#if page == "profile"}
		<DataForm bind:profileData={profileData}/>
		{/if}
		{#if page == "search"}
		<TableView bind:studentData={studentData}/>
		{/if}
		{#if page != "signin"}
		<SignOut bind:signedIn={signedIn} bind:page={page} />
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

	@media (min-width: 640px) {
		main {
			max-width: none;
		}
	}
</style>